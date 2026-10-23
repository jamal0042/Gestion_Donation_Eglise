-- ============================================================================
-- Offrandes de l'eglise : ajout des categories CDF / USD
-- A executer dans Supabase : Dashboard > SQL Editor > coller > Run.
-- (Apres 0001_init.sql ; peut etre relance sans risque.)
-- ============================================================================

-- Les libelles sont dans src/lib/offrandes.ts et la devise se deduit du code
-- (suffixe _cdf -> CDF, sinon USD).

alter type public.type_offrande add value if not exists 'zaka_cdf';
alter type public.type_offrande add value if not exists 'zaka_usd';
alter type public.type_offrande add value if not exists 'zaka_prison_cdf';
alter type public.type_offrande add value if not exists 'zaka_prison_usd';
alter type public.type_offrande add value if not exists 'zaka_chungu_chungu_cdf';
alter type public.type_offrande add value if not exists 'zaka_chungu_chungu_usd';
alter type public.type_offrande add value if not exists 'zaka_jumla_cdf';
alter type public.type_offrande add value if not exists 'zaka_jumla_usd';
alter type public.type_offrande add value if not exists 'pourcentage_50_cdf';
alter type public.type_offrande add value if not exists 'pourcentage_50_usd';
alter type public.type_offrande add value if not exists 'pourcentage_10_cdf';
alter type public.type_offrande add value if not exists 'pourcentage_10_usd';
alter type public.type_offrande add value if not exists 'pourcentage_40_cdf';
alter type public.type_offrande add value if not exists 'pourcentage_40_usd';
alter type public.type_offrande add value if not exists 'sadaka_prison_cdf';
alter type public.type_offrande add value if not exists 'sadaka_prison_usd';
alter type public.type_offrande add value if not exists 'sadaka_semaine_cdf';
alter type public.type_offrande add value if not exists 'sadaka_semaine_usd';
alter type public.type_offrande add value if not exists 'sadaka_jumla_cdf';
alter type public.type_offrande add value if not exists 'sadaka_jumla_usd';
alter type public.type_offrande add value if not exists 'maendeleo_cdf';
alter type public.type_offrande add value if not exists 'maendeleo_usd';
alter type public.type_offrande add value if not exists 'shukrani_cdf';
alter type public.type_offrande add value if not exists 'shukrani_usd';
alter type public.type_offrande add value if not exists 'bur_kim_cdf';
alter type public.type_offrande add value if not exists 'bur_kim_usd';
alter type public.type_offrande add value if not exists 'raves_cdf';
alter type public.type_offrande add value if not exists 'raves_usd';
alter type public.type_offrande add value if not exists 'evangel_cdf';
alter type public.type_offrande add value if not exists 'evangel_usd';
alter type public.type_offrande add value if not exists 'eds_enfant_cdf';
alter type public.type_offrande add value if not exists 'eds_enfant_usd';
alter type public.type_offrande add value if not exists 'sabbat_13_cdf';
alter type public.type_offrande add value if not exists 'sabbat_13_usd';
alter type public.type_offrande add value if not exists 'mifem_dorcas_cdf';
alter type public.type_offrande add value if not exists 'mifem_dorcas_usd';
alter type public.type_offrande add value if not exists 'ja_cdf';
alter type public.type_offrande add value if not exists 'ja_usd';
alter type public.type_offrande add value if not exists 'communication_cdf';
alter type public.type_offrande add value if not exists 'communication_usd';
alter type public.type_offrande add value if not exists 'bon_samaritain_cdf';
alter type public.type_offrande add value if not exists 'bon_samaritain_usd';
alter type public.type_offrande add value if not exists 'choral_habari_njema_cdf';
alter type public.type_offrande add value if not exists 'choral_habari_njema_usd';
alter type public.type_offrande add value if not exists 'choral_la_voix_de_l_esperance_cdf';
alter type public.type_offrande add value if not exists 'choral_la_voix_de_l_esperance_usd';
alter type public.type_offrande add value if not exists 'choral_i_will_go_cdf';
alter type public.type_offrande add value if not exists 'choral_i_will_go_usd';
alter type public.type_offrande add value if not exists 'choral_children_cdf';
alter type public.type_offrande add value if not exists 'choral_children_usd';
alter type public.type_offrande add value if not exists 'arambe_cdf';
alter type public.type_offrande add value if not exists 'arambe_usd';
alter type public.type_offrande add value if not exists 'construction_eglise_cdf';
alter type public.type_offrande add value if not exists 'construction_eglise_usd';
alter type public.type_offrande add value if not exists 'mission_kibali_ituri_cdf';
alter type public.type_offrande add value if not exists 'mission_kibali_ituri_usd';
alter type public.type_offrande add value if not exists 'sda_bunia_ville_cdf';
alter type public.type_offrande add value if not exists 'sda_bunia_ville_usd';
alter type public.type_offrande add value if not exists 'total_cdf';
alter type public.type_offrande add value if not exists 'total_usd';
