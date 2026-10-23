export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profils: {
        Row: {
          id: string;
          nom: string;
          telephone: string | null;
          role: Database["public"]["Enums"]["role"];
          donateur_id: string | null;
          source: string;
          cree_le: string;
        };
        Insert: {
          id: string;
          nom: string;
          telephone?: string | null;
          role?: Database["public"]["Enums"]["role"];
          donateur_id?: string | null;
          source?: string;
          cree_le?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string | null;
          role?: Database["public"]["Enums"]["role"];
          donateur_id?: string | null;
          source?: string;
          cree_le?: string;
        };
        Relationships: [];
      };
      donateurs: {
        Row: {
          id: string;
          nom: string;
          telephone: string | null;
          email: string | null;
          cree_le: string;
        };
        Insert: {
          id?: string;
          nom: string;
          telephone?: string | null;
          email?: string | null;
          cree_le?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          telephone?: string | null;
          email?: string | null;
          cree_le?: string;
        };
        Relationships: [];
      };
      projets: {
        Row: {
          id: string;
          nom: string;
          description: string;
          objectif: number;
          collecte: number;
          statut: Database["public"]["Enums"]["statut_projet"];
          date_debut: string;
        };
        Insert: {
          id?: string;
          nom: string;
          description?: string;
          objectif?: number;
          collecte?: number;
          statut?: Database["public"]["Enums"]["statut_projet"];
          date_debut?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          description?: string;
          objectif?: number;
          collecte?: number;
          statut?: Database["public"]["Enums"]["statut_projet"];
          date_debut?: string;
        };
        Relationships: [];
      };
      operations: {
        Row: {
          id: string;
          numero_recu: string;
          date: string;
          montant: number;
          type: Database["public"]["Enums"]["type_offrande"];
          methode: Database["public"]["Enums"]["methode_paiement"];
          donateur_id: string;
          donateur_nom: string;
          projet_id: string | null;
          note: string | null;
          cree_par: string | null;
          cree_le: string;
        };
        Insert: {
          id?: string;
          numero_recu?: string;
          date?: string;
          montant: number;
          type: Database["public"]["Enums"]["type_offrande"];
          methode: Database["public"]["Enums"]["methode_paiement"];
          donateur_id: string;
          donateur_nom: string;
          projet_id?: string | null;
          note?: string | null;
          cree_par?: string | null;
          cree_le?: string;
        };
        Update: {
          id?: string;
          numero_recu?: string;
          date?: string;
          montant?: number;
          type?: Database["public"]["Enums"]["type_offrande"];
          methode?: Database["public"]["Enums"]["methode_paiement"];
          donateur_id?: string;
          donateur_nom?: string;
          projet_id?: string | null;
          note?: string | null;
          cree_par?: string | null;
          cree_le?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      recalculer_collecte: {
        Args: { p_projet_id: string };
        Returns: number;
      };
      est_tresorier: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      role: "tresorier" | "membre";
      type_offrande:
        | "dime"
        | "offrande"
        | "don"
        | "aumone"
        | "cotisation"
        | "zaka_cdf"
        | "zaka_usd"
        | "zaka_prison_cdf"
        | "zaka_prison_usd"
        | "zaka_chungu_chungu_cdf"
        | "zaka_chungu_chungu_usd"
        | "zaka_jumla_cdf"
        | "zaka_jumla_usd"
        | "pourcentage_50_cdf"
        | "pourcentage_50_usd"
        | "pourcentage_10_cdf"
        | "pourcentage_10_usd"
        | "pourcentage_40_cdf"
        | "pourcentage_40_usd"
        | "sadaka_prison_cdf"
        | "sadaka_prison_usd"
        | "sadaka_semaine_cdf"
        | "sadaka_semaine_usd"
        | "sadaka_jumla_cdf"
        | "sadaka_jumla_usd"
        | "maendeleo_cdf"
        | "maendeleo_usd"
        | "shukrani_cdf"
        | "shukrani_usd"
        | "bur_kim_cdf"
        | "bur_kim_usd"
        | "raves_cdf"
        | "raves_usd"
        | "evangel_cdf"
        | "evangel_usd"
        | "eds_enfant_cdf"
        | "eds_enfant_usd"
        | "sabbat_13_cdf"
        | "sabbat_13_usd"
        | "mifem_dorcas_cdf"
        | "mifem_dorcas_usd"
        | "ja_cdf"
        | "ja_usd"
        | "communication_cdf"
        | "communication_usd"
        | "bon_samaritain_cdf"
        | "bon_samaritain_usd"
        | "choral_habari_njema_cdf"
        | "choral_habari_njema_usd"
        | "choral_la_voix_de_l_esperance_cdf"
        | "choral_la_voix_de_l_esperance_usd"
        | "choral_i_will_go_cdf"
        | "choral_i_will_go_usd"
        | "choral_children_cdf"
        | "choral_children_usd"
        | "arambe_cdf"
        | "arambe_usd"
        | "construction_eglise_cdf"
        | "construction_eglise_usd"
        | "mission_kibali_ituri_cdf"
        | "mission_kibali_ituri_usd"
        | "sda_bunia_ville_cdf"
        | "sda_bunia_ville_usd"
        | "total_cdf"
        | "total_usd";
      methode_paiement: "especes" | "mobile_money" | "virement" | "cheque";
      statut_projet: "en_cours" | "termine" | "planifie";
    };
    CompositeTypes: Record<never, never>;
  };
};
