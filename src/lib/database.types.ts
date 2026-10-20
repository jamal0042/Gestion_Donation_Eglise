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
      type_offrande: "dime" | "offrande" | "don" | "aumone" | "cotisation";
      methode_paiement: "especes" | "mobile_money" | "virement" | "cheque";
      statut_projet: "en_cours" | "termine" | "planifie";
    };
    CompositeTypes: Record<never, never>;
  };
};
