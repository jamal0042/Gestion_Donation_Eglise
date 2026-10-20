-- ============================================================================
-- Gestion de la trésorerie — Église de Bunia
-- Migration initiale : tables, types, index, triggers et politiques RLS.
-- À exécuter dans Supabase : Dashboard > SQL Editor > coller > Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Énumérations (alignées sur src/lib/types.ts)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'role') then
    create type public.role as enum ('tresorier', 'membre');
  end if;
  if not exists (select 1 from pg_type where typname = 'type_offrande') then
    create type public.type_offrande as enum ('dime', 'offrande', 'don', 'aumone', 'cotisation');
  end if;
  if not exists (select 1 from pg_type where typname = 'methode_paiement') then
    create type public.methode_paiement as enum ('especes', 'mobile_money', 'virement', 'cheque');
  end if;
  if not exists (select 1 from pg_type where typname = 'statut_projet') then
    create type public.statut_projet as enum ('en_cours', 'termine', 'planifie');
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- 2. Profils utilisateurs (liés à auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profils (
  id                uuid primary key references auth.users (id) on delete cascade,
  nom               text not null,
  telephone         text,
  role              public.role not null default 'membre',
  donateur_id       uuid,
  source            text not null default 'local',
  cree_le           timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Donateurs
-- ----------------------------------------------------------------------------
create table if not exists public.donateurs (
  id         uuid primary key default gen_random_uuid(),
  nom        text not null,
  telephone  text,
  email      text,
  cree_le    timestamptz not null default now()
);

create index if not exists donateurs_email_idx on public.donateurs (lower(email));
create index if not exists donateurs_nom_idx on public.donateurs (lower(nom));
create index if not exists donateurs_tel_idx on public.donateurs (telephone);

-- ----------------------------------------------------------------------------
-- 4. Projets
-- ----------------------------------------------------------------------------
create table if not exists public.projets (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  description text not null default '',
  objectif    numeric(14, 2) not null default 0,
  collecte    numeric(14, 2) not null default 0,
  statut      public.statut_projet not null default 'en_cours',
  date_debut  date not null default current_date
);

-- ----------------------------------------------------------------------------
-- 5. Opérations (dîmes / offrandes / dons)
-- ----------------------------------------------------------------------------
create table if not exists public.operations (
  id            uuid primary key default gen_random_uuid(),
  numero_recu   text not null unique,
  date          timestamptz not null default now(),
  montant       numeric(14, 2) not null check (montant > 0),
  type          public.type_offrande not null,
  methode       public.methode_paiement not null,
  donateur_id   uuid not null references public.donateurs (id) on delete cascade,
  donateur_nom  text not null,
  projet_id     uuid references public.projets (id) on delete set null,
  note          text,
  cree_par      text,
  cree_le       timestamptz not null default now()
);

create index if not exists operations_date_idx on public.operations (date desc);
create index if not exists operations_donateur_idx on public.operations (donateur_id);
create index if not exists operations_projet_idx on public.operations (projet_id);
create index if not exists operations_type_idx on public.operations (type);

-- ----------------------------------------------------------------------------
-- 6. Lien donateur <-> profil (clé étrangère ajoutée après création des tables)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profils_donateur_id_fkey'
  ) then
    alter table public.profils
      add constraint profils_donateur_id_fkey
      foreign key (donateur_id) references public.donateurs (id) on delete set null;
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- 7. Création automatique du profil à l'inscription (auth.users -> profils)
--    Le rôle et le lien donateur sont fournis via les métadonnées d'inscription.
-- ----------------------------------------------------------------------------
create or replace function public.gerer_nouvel_utilisateur()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profils (id, nom, telephone, role, donateur_id, source)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'telephone',
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.role,
      'membre'::public.role
    ),
    nullif(new.raw_user_meta_data ->> 'donateur_id', '')::uuid,
    coalesce(new.raw_user_meta_data ->> 'source', 'local')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.gerer_nouvel_utilisateur();

-- ----------------------------------------------------------------------------
-- 8. Recalcul de la collecte d'un projet (appelable par le trésorier)
-- ----------------------------------------------------------------------------
create or replace function public.recalculer_collecte(p_projet_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  total numeric(14, 2);
begin
  select coalesce(sum(montant), 0)
    into total
    from public.operations
   where projet_id = p_projet_id;

  update public.projets
     set collecte = total
   where id = p_projet_id;

  return total;
end;
$$;

-- ----------------------------------------------------------------------------
-- 9. Génération du numéro de reçu côté base (séquence par année)
--    La fonction est appelée par le trigger d'insertion, donc le numéro est
--    toujours cohérent même en cas d'écritures concurrentes.
-- ----------------------------------------------------------------------------
create or replace function public.generer_numero_recu()
returns trigger
language plpgsql
as $$
declare
  v_annee  text;
  v_compte integer;
begin
  if new.numero_recu is not null and new.numero_recu <> '' then
    return new;
  end if;

  v_annee := to_char(new.date, 'YYYY');
  select count(*) + 1
    into v_compte
    from public.operations
   where numero_recu like 'REC-' || v_annee || '-%';

  new.numero_recu := 'REC-' || v_annee || '-' || lpad(v_compte::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists operations_numero_recu on public.operations;
create trigger operations_numero_recu
  before insert on public.operations
  for each row execute function public.generer_numero_recu();

-- ----------------------------------------------------------------------------
-- 10. Row Level Security
--     L'application accède principalement aux données via la clé service_role
--     (routes serveur), qui ignore RLS. Ces politiques protègent l'accès
--     direct via la clé anon (navigateur, QR code, etc.).
-- ----------------------------------------------------------------------------
alter table public.profils  enable row level security;
alter table public.donateurs enable row level security;
alter table public.projets   enable row level security;
alter table public.operations enable row level security;

-- Aide : le rôle de l'utilisateur connecté (via son profil).
create or replace function public.est_tresorier()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profils
     where id = auth.uid() and role = 'tresorier'
  );
$$;

-- Profils : chacun lit et modifie son propre profil ; le trésorier voit tout.
drop policy if exists profils_lecture_propre on public.profils;
create policy profils_lecture_propre on public.profils
  for select using (id = auth.uid() or public.est_tresorier());

drop policy if exists profils_maj_propre on public.profils;
create policy profils_maj_propre on public.profils
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Projets : lecture publique, écriture réservée au trésorier.
drop policy if exists projets_lecture_publique on public.projets;
create policy projets_lecture_publique on public.projets
  for select using (true);

drop policy if exists projets_ecriture_tresorier on public.projets;
create policy projets_ecriture_tresorier on public.projets
  for all using (public.est_tresorier()) with check (public.est_tresorier());

-- Donateurs : un donateur voit sa fiche ; le trésorier gère tout.
drop policy if exists donateurs_lecture on public.donateurs;
create policy donateurs_lecture on public.donateurs
  for select using (
    public.est_tresorier()
    or exists (
      select 1 from public.profils
       where profils.id = auth.uid() and profils.donateur_id = donateurs.id
    )
  );

drop policy if exists donateurs_creation_publique on public.donateurs;
create policy donateurs_creation_publique on public.donateurs
  for insert with check (true);

drop policy if exists donateurs_ecriture_tresorier on public.donateurs;
create policy donateurs_ecriture_tresorier on public.donateurs
  for update using (public.est_tresorier()) with check (public.est_tresorier());

-- Opérations : le trésorier voit tout, le donateur voit les siennes,
-- tout le monde peut enregistrer un don public.
drop policy if exists operations_lecture on public.operations;
create policy operations_lecture on public.operations
  for select using (
    public.est_tresorier()
    or exists (
      select 1 from public.profils
       where profils.id = auth.uid() and profils.donateur_id = operations.donateur_id
    )
  );

drop policy if exists operations_creation_publique on public.operations;
create policy operations_creation_publique on public.operations
  for insert with check (true);

drop policy if exists operations_ecriture_tresorier on public.operations;
create policy operations_ecriture_tresorier on public.operations
  for update using (public.est_tresorier()) with check (public.est_tresorier());

-- ----------------------------------------------------------------------------
-- 11. (Manuel) Pour promouvoir un compte trésorier après son inscription :
--   update public.profils set role = 'tresorier' where id = '<uuid-utilisateur>';
-- ----------------------------------------------------------------------------
