-- ============================================================================
-- Gestion de la tresorerie - Eglise de Bunia
-- Migration 0003 : detail d'une operation en plusieurs contributions.
--
-- Une meme operation (un recu, un paiement) peut desormais couvrir plusieurs
-- types d'offrande, comme une vente en boutique avec plusieurs articles.
-- Le detail est stocke dans une colonne jsonb : [{"type": "...", "montant": 0}]
--
-- A executer dans Supabase : Dashboard > SQL Editor > coller > Run.
-- ============================================================================

alter table public.operations
  add column if not exists lignes jsonb not null default '[]'::jsonb;

-- La colonne doit toujours contenir un tableau (vide pour les anciennes
-- operations, qui gardent leur type et leur montant uniques).
alter table public.operations
  drop constraint if exists operations_lignes_tableau;

alter table public.operations
  add constraint operations_lignes_tableau
  check (jsonb_typeof(lignes) = 'array');

comment on column public.operations.lignes is
  'Detail des contributions d''une operation : [{"type": "zaka_cdf", "montant": 5000}]. Vide = operation a type unique (colonnes type et montant).';
