import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { erreur, lireBody } from "@/lib/api";
import { enregistrerProjet, getProjets } from "@/lib/store";
import type { StatutProjet } from "@/lib/types";

const STATUTS: StatutProjet[] = ["en_cours", "termine", "planifie"];

export async function GET() {
  const projets = await getProjets();
  return Response.json({ projets });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);
  if (session.role !== "tresorier")
    return erreur("Accès réservé au trésorier.", 403);

  const body = await lireBody<{
    id?: string;
    nom?: string;
    description?: string;
    objectif?: number;
    collecte?: number;
    statut?: string;
    dateDebut?: string;
  }>(request);

  if (!body?.nom || body.nom.trim().length < 3)
    return erreur("Le nom du projet est obligatoire.");

  const objectif = Number(body.objectif);
  if (!Number.isFinite(objectif) || objectif <= 0)
    return erreur("L'objectif financier doit être supérieur à 0.");

  const statut = (STATUTS.includes(body.statut as StatutProjet)
    ? body.statut
    : "en_cours") as StatutProjet;

  const projet = await enregistrerProjet({
    id: body.id,
    nom: body.nom.trim(),
    description: body.description?.trim() ?? "",
    objectif,
    collecte: Number(body.collecte) || 0,
    statut,
    dateDebut: body.dateDebut || new Date().toISOString().slice(0, 10),
  });

  return Response.json({ ok: true, projet });
}
