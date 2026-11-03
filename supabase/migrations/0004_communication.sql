-- ============================================================================
-- Gestion de la tresorerie - Eglise de Bunia
-- Migration 0004 : espace communication / publication de predications
--
-- A executer dans Supabase : Dashboard > SQL Editor > coller > Run.
-- ============================================================================

-- 1) Ajouter le role communication
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'role' and e.enumlabel = 'communication'
  ) then
    alter type public.role add value 'communication';
  end if;
end
$$;

-- 2) Table des contenus (predications, annonces, evenements, articles)
create table if not exists public.contenus (
  id              uuid primary key default gen_random_uuid(),
  titre           text not null,
  slug            text not null unique,
  type            text not null default 'predication'
                    check (type in ('predication','annonce','evenement','article')),
  resume          text,
  corps           text,
  orateur         text,
  date_evenement  timestamptz,
  media           jsonb not null default '[]'::jsonb,
  tags            text[] not null default '{}',
  publie          boolean not null default false,
  publie_le       timestamptz,
  auteur_id       uuid references auth.users (id) on delete set null,
  auteur_nom      text,
  cree_le         timestamptz not null default now(),
  maj_le          timestamptz not null default now()
);

create index if not exists contenus_type_idx on public.contenus (type);
create index if not exists contenus_publie_idx on public.contenus (publie, publie_le desc);
create index if not exists contenus_slug_idx on public.contenus (slug);
create index if not exists contenus_date_idx on public.contenus (date_evenement desc);

-- 3) Mise a jour automatique maj_le
create or replace function public.maj_contenus()
returns trigger
language plpgsql
as $$
begin
  new.maj_le = now();
  if new.publie and (old.publie is distinct from new.publie or new.publie_le is null) then
    new.publie_le = coalesce(new.publie_le, now());
  end if;
  if not new.publie then
    new.publie_le = null;
  end if;
  return new;
end;
$$;

drop trigger if exists contenus_maj_le on public.contenus;
create trigger contenus_maj_le
  before update on public.contenus
  for each row execute function public.maj_contenus();

-- 4) RLS
alter table public.contenus enable row level security;

-- Tout le monde peut lire les contenus publies
drop policy if exists contenus_lecture_publique on public.contenus;
create policy contenus_lecture_publique on public.contenus
  for select using (publie = true);

-- Le responsable communication et le tresorier peuvent tout gerer
create or replace function public.est_responsable_communication()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profils
     where id = auth.uid() and role in ('communication', 'tresorier')
  );
$$;

drop policy if exists contenus_gestion_communication on public.contenus;
create policy contenus_gestion_communication on public.contenus
  for all using (public.est_responsable_communication())
       with check (public.est_responsable_communication());

-- 5) Bucket de stockage pour les medias (audios/vidéos/images de prédications)
-- À exécuter dans Storage > Policies ou via SQL si autorisé.
-- Si le bucket existe déjà, ignorer.
insert into storage.buckets (id, name, public)
values ('predications', 'predications', true)
on conflict (id) do nothing;
