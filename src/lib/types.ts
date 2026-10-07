export type Role = "tresorier" | "membre";

export type TypeOffrande =
  | "dime"
  | "offrande"
  | "don"
  | "aumone"
  | "cotisation";

export type MethodePaiement =
  | "especes"
  | "mobile_money"
  | "virement"
  | "cheque";

export type StatutProjet = "en_cours" | "termine" | "planifie";

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  telephone?: string;
  role: Role;
  motDePasseHash?: string;
  donateurId?: string;
  creeLe: string;
  source?: "local" | "google";
}

export interface Donateur {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
  creeLe: string;
}

export interface Operation {
  id: string;
  numeroRecu: string;
  date: string;
  montant: number;
  type: TypeOffrande;
  methode: MethodePaiement;
  donateurId: string;
  donateurNom: string;
  projetId?: string | null;
  note?: string;
  creePar?: string;
}

export interface Projet {
  id: string;
  nom: string;
  description: string;
  objectif: number;
  collecte: number;
  statut: StatutProjet;
  dateDebut: string;
}

export interface ResetToken {
  token: string;
  email: string;
  expire: string;
}

export interface SessionPayload {
  sub: string;
  nom: string;
  email: string;
  role: Role;
  donateurId?: string;
}

export const LIBELLES_TYPE: Record<TypeOffrande, string> = {
  dime: "Dîme",
  offrande: "Offrande",
  don: "Don",
  aumone: "Aumône",
  cotisation: "Cotisation",
};

export const LIBELLES_METHODE: Record<MethodePaiement, string> = {
  especes: "Espèces",
  mobile_money: "Mobile Money",
  virement: "Virement",
  cheque: "Chèque",
};

export const LIBELLES_STATUT: Record<StatutProjet, string> = {
  en_cours: "En cours",
  termine: "Terminé",
  planifie: "Planifié",
};
