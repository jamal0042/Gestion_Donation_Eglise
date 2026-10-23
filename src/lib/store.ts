import type {
  Donateur,
  LigneOffrande,
  Operation,
  Projet,
  Role,
  TypeOffrande,
  Utilisateur,
} from "./types";
import {
  detailOperation,
  deviseDeType,
  estCodeOffrande,
  totalLignes,
} from "./offrandes";
import type { Devise } from "./offrandes";
import type { Database } from "./database.types";
import { creerClientAdmin } from "./supabase/server";

type LigneOperation = Database["public"]["Tables"]["operations"]["Row"];
type LigneDonateur = Database["public"]["Tables"]["donateurs"]["Row"];
type LigneProjet = Database["public"]["Tables"]["projets"]["Row"];
type LigneProfil = Database["public"]["Tables"]["profils"]["Row"];

/** Relit le détail jsonb d'une opération en ignorant les entrées invalides. */
function versLignes(valeur: unknown): LigneOffrande[] | undefined {
  if (!Array.isArray(valeur)) return undefined;
  const lignes: LigneOffrande[] = [];
  for (const entree of valeur) {
    if (!entree || typeof entree !== "object") continue;
    const { type, montant } = entree as { type?: unknown; montant?: unknown };
    const nombre = Number(montant);
    if (typeof type !== "string" || !estCodeOffrande(type)) continue;
    if (!Number.isFinite(nombre) || nombre <= 0) continue;
    lignes.push({ type, montant: nombre });
  }
  return lignes.length > 0 ? lignes : undefined;
}

function versOperation(ligne: LigneOperation): Operation {
  const lignes = versLignes(ligne.lignes);
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
    ...(lignes ? { lignes } : {}),
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

  const lignes = (input.lignes ?? []).filter(
    (ligne) => Number(ligne.montant) > 0
  );
  const principale = lignes.reduce<LigneOffrande | null>(
    (plus, ligne) => (!plus || ligne.montant > plus.montant ? ligne : plus),
    null
  );

  const { data, error } = await supabase
    .from("operations")
    .insert({
      numero_recu: input.numeroRecu,
      date: input.date,
      montant: lignes.length > 0 ? totalLignes(lignes) : input.montant,
      type: principale?.type ?? input.type,
      methode: input.methode,
      donateur_id: input.donateurId,
      donateur_nom: input.donateurNom,
      projet_id: input.projetId ?? null,
      note: input.note ?? null,
      cree_par: input.creePar ?? null,
      lignes: lignes.map((ligne) => ({
        type: ligne.type,
        montant: ligne.montant,
      })),
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

export async function majProfil(
  id: string,
  valeurs: { nom?: string; telephone?: string | null }
): Promise<Utilisateur> {
  const supabase = creerClientAdmin();
  const { data, error } = await supabase
    .from("profils")
    .update(valeurs)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return versUtilisateur(data);
}

export async function majDonateur(
  id: string,
  valeurs: { nom?: string; telephone?: string | null; email?: string | null }
): Promise<void> {
  const supabase = creerClientAdmin();
  const { error } = await supabase
    .from("donateurs")
    .update(valeurs)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Statistiques
// ---------------------------------------------------------------------------
export interface Statistiques {
  /** Totaux en dollars (les montants en CDF ne sont jamais additionnés). */
  totalMois: number;
  totalAnnee: number;
  totalGeneral: number;
  nbOperations: number;
  nbDonateurs: number;
  nbProjetsActifs: number;
  parType: { type: TypeOffrande; total: number; nombre: number }[];
  parDevise: {
    devise: Devise;
    totalMois: number;
    totalAnnee: number;
    totalGeneral: number;
    nombre: number;
  }[];
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

  const parDeviseMap = new Map<
    Devise,
    {
      devise: Devise;
      totalMois: number;
      totalAnnee: number;
      totalGeneral: number;
      nombre: number;
    }
  >();

  for (const o of operations) {
    const devise = deviseDeType(o.type);
    const courant = parDeviseMap.get(devise) ?? {
      devise,
      totalMois: 0,
      totalAnnee: 0,
      totalGeneral: 0,
      nombre: 0,
    };
    const d = new Date(o.date);
    if (d.getMonth() === moisCourant && d.getFullYear() === anneeCourante)
      courant.totalMois += o.montant;
    if (d.getFullYear() === anneeCourante) courant.totalAnnee += o.montant;
    courant.totalGeneral += o.montant;
    courant.nombre += 1;
    parDeviseMap.set(devise, courant);
  }

  const parDevise = [...parDeviseMap.values()].sort((a, b) =>
    a.devise.localeCompare(b.devise)
  );

  const usd = parDeviseMap.get("USD");

  const parTypeMap = new Map<
    string,
    { type: TypeOffrande; total: number; nombre: number }
  >();
  for (const o of operations) {
    for (const ligne of detailOperation(o)) {
      const type = ligne.type as TypeOffrande;
      const courant = parTypeMap.get(type) ?? {
        type,
        total: 0,
        nombre: 0,
      };
      courant.total += ligne.montant;
      courant.nombre += 1;
      parTypeMap.set(type, courant);
    }
  }

  return {
    totalMois: usd?.totalMois ?? 0,
    totalAnnee: usd?.totalAnnee ?? 0,
    totalGeneral: usd?.totalGeneral ?? 0,
    nbOperations: operations.length,
    nbDonateurs: donneurs.length,
    nbProjetsActifs: projets.filter((p) => p.statut === "en_cours").length,
    parType: [...parTypeMap.values()].sort((a, b) => b.total - a.total),
    parDevise,
  };
}
