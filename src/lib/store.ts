import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Donateur,
  Operation,
  Projet,
  ResetToken,
  TypeOffrande,
  Utilisateur,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function lireJson<T>(fichier: string, defaut: T): Promise<T> {
  try {
    const brut = await fs.readFile(path.join(DATA_DIR, fichier), "utf-8");
    return JSON.parse(brut) as T;
  } catch {
    return defaut;
  }
}

async function ecrireJson(fichier: string, donnees: unknown): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    path.join(DATA_DIR, fichier),
    JSON.stringify(donnees, null, 2),
    "utf-8"
  );
}

function trierOperations(operations: Operation[]): Operation[] {
  return [...operations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getOperations(): Promise<Operation[]> {
  return trierOperations(await lireJson<Operation[]>("operations.json", []));
}

export async function getOperation(id: string): Promise<Operation | null> {
  const operations = await getOperations();
  return operations.find((o) => o.id === id) ?? null;
}

export async function getOperationsDonateur(
  donateurId: string
): Promise<Operation[]> {
  const operations = await getOperations();
  return operations.filter((o) => o.donateurId === donateurId);
}

export async function ajouterOperation(
  input: Omit<Operation, "id" | "numeroRecu"> & { numeroRecu?: string }
): Promise<Operation> {
  const operations = await getOperations();
  const annee = new Date(input.date).getFullYear();
  const prefixe = `REC-${annee}-`;
  const duannee = operations.filter((o) =>
    o.numeroRecu.startsWith(prefixe)
  ).length;
  const numero =
    input.numeroRecu ??
    `${prefixe}${String(duannee + 1).padStart(4, "0")}`;

  const operation: Operation = {
    ...input,
    id: randomUUID(),
    numeroRecu: numero,
  };
  operations.push(operation);
  await ecrireJson("operations.json", operations);
  return operation;
}

export async function getDonateurs(): Promise<Donateur[]> {
  const donnees = await lireJson<Donateur[]>("donateurs.json", []);
  return [...donnees].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export async function getDonateur(id: string): Promise<Donateur | null> {
  const donnees = await getDonateurs();
  return donnees.find((d) => d.id === id) ?? null;
}

export async function ajouterDonateur(
  input: Omit<Donateur, "id" | "creeLe">
): Promise<Donateur> {
  const donnees = await lireJson<Donateur[]>("donateurs.json", []);
  const donateur: Donateur = {
    ...input,
    id: randomUUID(),
    creeLe: new Date().toISOString(),
  };
  donnees.push(donateur);
  await ecrireJson("donateurs.json", donnees);
  return donateur;
}

export async function trouverOuCreerDonateur(input: {
  nom: string;
  telephone?: string;
  email?: string;
}): Promise<Donateur> {
  const donnees = await lireJson<Donateur[]>("donateurs.json", []);
  const existant = donnees.find(
    (d) =>
      (input.email && d.email?.toLowerCase() === input.email.toLowerCase()) ||
      (input.telephone && d.telephone === input.telephone) ||
      d.nom.toLowerCase() === input.nom.toLowerCase()
  );
  if (existant) return existant;
  return ajouterDonateur(input);
}

export async function getProjets(): Promise<Projet[]> {
  const donnees = await lireJson<Projet[]>("projets.json", []);
  return [...donnees].sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
}

export async function getProjet(id: string): Promise<Projet | null> {
  const donnees = await getProjets();
  return donnees.find((p) => p.id === id) ?? null;
}

export async function enregistrerProjet(
  input: Omit<Projet, "id"> & { id?: string }
): Promise<Projet> {
  const donnees = await lireJson<Projet[]>("projets.json", []);
  if (input.id) {
    const index = donnees.findIndex((p) => p.id === input.id);
    if (index >= 0) {
      donnees[index] = { ...donnees[index], ...input, id: input.id };
      await ecrireJson("projets.json", donnees);
      return donnees[index];
    }
  }
  const projet: Projet = { ...input, id: randomUUID() };
  donnees.push(projet);
  await ecrireJson("projets.json", donnees);
  return projet;
}

export async function reinitialiserCollecte(
  projetId: string
): Promise<void> {
  const operations = await getOperations();
  const total = operations
    .filter((o) => o.projetId === projetId)
    .reduce((somme, o) => somme + o.montant, 0);
  const projets = await lireJson<Projet[]>("projets.json", []);
  const index = projets.findIndex((p) => p.id === projetId);
  if (index >= 0) {
    projets[index].collecte = total;
    await ecrireJson("projets.json", projets);
  }
}

export async function getUsers(): Promise<Utilisateur[]> {
  return lireJson<Utilisateur[]>("users.json", []);
}

export async function trouverUserParEmail(
  email: string
): Promise<Utilisateur | null> {
  const users = await getUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  );
}

export async function trouverUser(id: string): Promise<Utilisateur | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function ajouterUser(
  input: Omit<Utilisateur, "id" | "creeLe">
): Promise<Utilisateur> {
  const users = await getUsers();
  const user: Utilisateur = {
    ...input,
    id: randomUUID(),
    creeLe: new Date().toISOString(),
  };
  users.push(user);
  await ecrireJson("users.json", users);
  return user;
}

export async function modifierMotDePasse(
  email: string,
  motDePasseHash: string
): Promise<boolean> {
  const users = await getUsers();
  const index = users.findIndex(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (index < 0) return false;
  users[index].motDePasseHash = motDePasseHash;
  await ecrireJson("users.json", users);
  return true;
}

export async function creerResetToken(email: string): Promise<string> {
  const tokens = await lireJson<ResetToken[]>("resets.json", []);
  const propre = tokens.filter((t) => t.email !== email);
  const token = randomUUID() + randomUUID().replace(/-/g, "");
  propre.push({
    token,
    email,
    expire: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  });
  await ecrireJson("resets.json", propre);
  return token;
}

export async function utiliserResetToken(
  token: string
): Promise<string | null> {
  const tokens = await lireJson<ResetToken[]>("resets.json", []);
  const trouve = tokens.find((t) => t.token === token);
  if (!trouve) return null;
  if (new Date(trouve.expire).getTime() < Date.now()) return null;
  await ecrireJson(
    "resets.json",
    tokens.filter((t) => t.token !== token)
  );
  return trouve.email;
}

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
