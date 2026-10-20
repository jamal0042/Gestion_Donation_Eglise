import type {
  Donateur,
  Operation,
  Projet,
  Role,
  TypeOffrande,
  Utilisateur,
} from "./types";
import type { Database } from "./database.types";
import { creerClientAdmin } from "./supabase/server";

type LigneOperation = Database["public"]["Tables"]["operations"]["Row"];
type LigneDonateur = Database["public"]["Tables"]["donateurs"]["Row"];
type LigneProjet = Database["public"]["Tables"]["projets"]["Row"];
type LigneProfil = Database["public"]["Tables"]["profils"]["Row"];

function versOperation(ligne: LigneOperation): Operation {
  return {
    id: ligne.id,
    numeroRecu: ligne.numero_recu,
    date: ligne.date,
    montant: Number(ligne.montant),
    type: ligne.type,
    methode: ligne.methode,
    donateurId: ligne.donateur_id,
    donateurNom: ligne.donateur_nom,
    projetId: ligne.projet_id,
    note: ligne.note ?? undefined,
    creePar: ligne.cree_par ?? undefined,
  };
}

function versDonateur(ligne: LigneDonateur): Donateur {
  return {
    id: ligne.id,
    nom: ligne.nom,
    telephone: ligne.telephone ?? undefined,
    email: ligne.email ?? undefined,
    creeLe: ligne.cree_le,
  };
}

function versProjet(ligne: LigneProjet): Projet {
  return {
    id: ligne.id,
    nom: ligne.nom,
    description: ligne.description,
    objectif: Number(ligne.objectif),
    collecte: Number(ligne.collecte),
    statut: ligne.statut,
    dateDebut: ligne.date_debut,
  };
}

export function versUtilisateur(ligne: LigneProfil): Utilisateur {
  return {
    id: ligne.id,
    nom: ligne.nom,
    email: "",
    telephone: ligne.telephone ?? undefined,
    role: ligne.role,
    donateurId: ligne.donateur_id ?? undefined,
    creeLe: ligne.cree_le,
    source: (ligne.source as Utilisateur["source"]) ?? "local",
  };
}

// ---------------------------------------------------------------------------
// Opérations
// ---------------------------------------------------------------------------
export async function getOperations(): Promise<Operation[]> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("operations")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(versOperation);
}

export async function getOperation(id: string): Promise<Operation | null> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("operations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? versOperation(data) : null;
}

export async function getOperationsDonateur(
  donateurId: string
): Promise<Operation[]> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("operations")
    .select("*")
    .eq("donateur_id", donateurId)
    .order("date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(versOperation);
}

export async function ajouterOperation(
  input: Omit<Operation, "id" | "numeroRecu"> & { numeroRecu?: string }
): Promise<Operation> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("operations")
    .insert({
      numero_recu: input.numeroRecu,
      date: input.date,
      montant: input.montant,
      type: input.type,
      methode: input.methode,
      donateur_id: input.donateurId,
      donateur_nom: input.donateurNom,
      projet_id: input.projetId ?? null,
      note: input.note ?? null,
      cree_par: input.creePar ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return versOperation(data);
}

// ---------------------------------------------------------------------------
// Donateurs
// ---------------------------------------------------------------------------
export async function getDonateurs(): Promise<Donateur[]> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("donateurs")
    .select("*")
    .order("nom", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(versDonateur);
}

export async function getDonateur(id: string): Promise<Donateur | null> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("donateurs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? versDonateur(data) : null;
}

export async function ajouterDonateur(
  input: Omit<Donateur, "id" | "creeLe">
): Promise<Donateur> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("donateurs")
    .insert({
      nom: input.nom,
      telephone: input.telephone ?? null,
      email: input.email ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return versDonateur(data);
}

export async function trouverOuCreerDonateur(input: {
  nom: string;
  telephone?: string;
  email?: string;
}): Promise<Donateur> {
  const supabase = creerClientAdmin();

  const filtres: string[] = [];
  if (input.email) filtres.push(`email.ilike.${input.email}`);
  if (input.telephone) filtres.push(`telephone.eq.${input.telephone}`);
  filtres.push(`nom.ilike.${input.nom}`);

  const { data, error } = await supabase
    .from("donateurs")
    .select("*")
    .or(filtres.join(","))
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return versDonateur(data);

  return ajouterDonateur(input);
}

// ---------------------------------------------------------------------------
// Projets
// ---------------------------------------------------------------------------
export async function getProjets(): Promise<Projet[]> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("projets")
    .select("*")
    .order("date_debut", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(versProjet);
}

export async function getProjet(id: string): Promise<Projet | null> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("projets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? versProjet(data) : null;
}

export async function enregistrerProjet(
  input: Omit<Projet, "id"> & { id?: string }
): Promise<Projet> {
  const supabase = creerClientAdmin();
  const valeurs = {
    nom: input.nom,
    description: input.description,
    objectif: input.objectif,
    collecte: input.collecte,
    statut: input.statut,
    date_debut: input.dateDebut,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("projets")
      .update(valeurs)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return versProjet(data);
  }

  const { data, error } = await supabase
    .from("projets")
    .insert(valeurs)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return versProjet(data);
}

export async function reinitialiserCollecte(projetId: string): Promise<void> {
  const supabase = creerClientAdmin();
  const { error } = await supabase.rpc("recalculer_collecte", {
    p_projet_id: projetId,
  });
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Profils utilisateurs
// ---------------------------------------------------------------------------
export async function trouverProfil(id: string): Promise<Utilisateur | null> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("profils")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? versUtilisateur(data) : null;
}

export async function majRole(id: string, role: Role): Promise<void> {
  const supabase = creerClientAdmin();
  const { error } = await supabase
    .from("profils")
    .update({ role })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Statistiques
// ---------------------------------------------------------------------------
export interface Statistiques {
  totalMois: number;
  totalAnnee: number;
  totalGeneral: number;
  nbOperations: number;
  nbDonateurs: number;
  nbProjetsActifs: number;
  parType: { type: TypeOffrande; total: number; nombre: number }[];
}

export async function getStatistiques(): Promise<Statistiques> {
  const [operations, donneurs, projets] = await Promise.all([
    getOperations(),
    getDonateurs(),
    getProjets(),
  ]);

  const maintenant = new Date();
  const moisCourant = maintenant.getMonth();
  const anneeCourante = maintenant.getFullYear();

  const totalMois = operations
    .filter((o) => {
      const d = new Date(o.date);
      return (
        d.getMonth() === moisCourant && d.getFullYear() === anneeCourante
      );
    })
    .reduce((s, o) => s + o.montant, 0);

  const totalAnnee = operations
    .filter((o) => new Date(o.date).getFullYear() === anneeCourante)
    .reduce((s, o) => s + o.montant, 0);

  const parTypeMap = new Map<
    string,
    { type: TypeOffrande; total: number; nombre: number }
  >();
  for (const o of operations) {
    const courant = parTypeMap.get(o.type) ?? {
      type: o.type,
      total: 0,
      nombre: 0,
    };
    courant.total += o.montant;
    courant.nombre += 1;
    parTypeMap.set(o.type, courant);
  }

  return {
    totalMois,
    totalAnnee,
    totalGeneral: operations.reduce((s, o) => s + o.montant, 0),
    nbOperations: operations.length,
    nbDonateurs: donneurs.length,
    nbProjetsActifs: projets.filter((p) => p.statut === "en_cours").length,
    parType: [...parTypeMap.values()].sort((a, b) => b.total - a.total),
  };
}
