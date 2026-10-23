import { type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import {
  EMAIL_RE,
  erreur,
  erreurConfigurationSupabase,
  lireBody,
} from "@/lib/api";
import {
  creerClientAdmin,
  creerClientServeur,
  serviceRoleConfigure,
} from "@/lib/supabase/server";
import {
  ajouterOperation,
  getOperations,
  getOperationsDonateur,
  reinitialiserCollecte,
  trouverOuCreerDonateur,
} from "@/lib/store";
import type { LigneOffrande, MethodePaiement, TypeOffrande } from "@/lib/types";
import { deviseDeType, estCodeOffrande } from "@/lib/offrandes";

const METHODES: MethodePaiement[] = [
  "especes",
  "mobile_money",
  "virement",
  "cheque",
];

const MAX_LIGNES = 20;

interface LigneBrute {
  type?: unknown;
  montant?: unknown;
}

/**
 * Valide et normalise les contributions d'un don. Un paiement peut couvrir
 * plusieurs types d'offrande, mais toujours dans une seule devise.
 */
function normaliserLignes(
  body: { lignes?: LigneBrute[]; type?: string; montant?: number }
): { lignes: LigneOffrande[] } | { erreur: string } {
  const brutes: LigneBrute[] =
    Array.isArray(body.lignes) && body.lignes.length > 0
      ? body.lignes
      : [{ type: body.type, montant: body.montant }];

  if (brutes.length > MAX_LIGNES) {
    return { erreur: `Un don ne peut pas dépasser ${MAX_LIGNES} contributions.` };
  }

  const cumul = new Map<TypeOffrande, number>();
  for (const brute of brutes) {
    const type = typeof brute?.type === "string" ? brute.type : "";
    const montant = Number(brute?.montant);
    if (!estCodeOffrande(type)) return { erreur: "Type d'offrande invalide." };
    if (!Number.isFinite(montant) || montant <= 0) {
      return { erreur: "Chaque contribution doit avoir un montant supérieur à 0." };
    }
    cumul.set(type, (cumul.get(type) ?? 0) + Math.round(montant * 100) / 100);
  }

  const lignes: LigneOffrande[] = [...cumul].map(([type, montant]) => ({
    type,
    montant,
  }));

  const devises = new Set(lignes.map((ligne) => deviseDeType(ligne.type)));
  if (devises.size > 1) {
    return {
      erreur:
        "Toutes les contributions d'un même don doivent être dans la même devise (CDF ou USD).",
    };
  }

  return { lignes };
}

export async function GET(request: NextRequest) {
  if (!serviceRoleConfigure()) return erreurConfigurationSupabase();

  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);

  const sp = request.nextUrl.searchParams;
  const mine = sp.get("mine") === "1";

  if (mine) {
    if (!session.donateurId) return Response.json({ operations: [] });
    const operations = await getOperationsDonateur(session.donateurId);
    return Response.json({ operations });
  }

  if (session.role !== "tresorier")
    return erreur("Accès réservé au trésorier.", 403);

  let operations = await getOperations();

  const q = sp.get("q")?.toLowerCase().trim();
  if (q) {
    operations = operations.filter(
      (o) =>
        o.donateurNom.toLowerCase().includes(q) ||
        o.numeroRecu.toLowerCase().includes(q) ||
        (o.note ?? "").toLowerCase().includes(q)
    );
  }

  const type = sp.get("type");
  if (type && estCodeOffrande(type)) {
    operations = operations.filter(
      (o) =>
        o.type === type ||
        (o.lignes ?? []).some((ligne) => ligne.type === type)
    );
  }

  const methode = sp.get("methode");
  if (methode && METHODES.includes(methode as MethodePaiement)) {
    operations = operations.filter((o) => o.methode === methode);
  }

  const projetId = sp.get("projetId");
  if (projetId) {
    operations = operations.filter((o) => o.projetId === projetId);
  }

  const donateurId = sp.get("donateurId");
  if (donateurId) {
    operations = operations.filter((o) => o.donateurId === donateurId);
  }

  const du = sp.get("du");
  if (du) {
    const debut = new Date(du).getTime();
    operations = operations.filter(
      (o) => new Date(o.date).getTime() >= debut
    );
  }

  const au = sp.get("au");
  if (au) {
    const fin = new Date(au);
    fin.setHours(23, 59, 59, 999);
    operations = operations.filter(
      (o) => new Date(o.date).getTime() <= fin.getTime()
    );
  }

  return Response.json({ operations });
}

export async function POST(request: Request) {
  if (!serviceRoleConfigure()) return erreurConfigurationSupabase();

  const body = await lireBody<{
    nom?: string;
    telephone?: string;
    email?: string;
    montant?: number;
    type?: string;
    lignes?: LigneBrute[];
    methode?: string;
    projetId?: string | null;
    note?: string;
    date?: string;
    creerCompte?: { email?: string; motDePasse?: string };
  }>(request);

  if (!body) return erreur("Corps de requête invalide.");

  const nom = body.nom?.trim() ?? "";
  const methode = body.methode as MethodePaiement;

  if (nom.length < 2) return erreur("Veuillez indiquer votre nom complet.");
  const contributions = normaliserLignes(body);
  if ("erreur" in contributions) return erreur(contributions.erreur);
  const { lignes } = contributions;
  if (lignes.length === 0)
    return erreur("Indiquez au moins une contribution.");
  if (!METHODES.includes(methode)) return erreur("Méthode de paiement invalide.");

  const donateur = await trouverOuCreerDonateur({
    nom,
    telephone: body.telephone?.trim() || undefined,
    email: body.email?.trim() || undefined,
  });

  let operation;
  try {
    operation = await ajouterOperation({
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
      montant: lignes.reduce((total, ligne) => total + ligne.montant, 0),
      type: lignes[0].type,
      lignes,
      methode,
      donateurId: donateur.id,
      donateurNom: donateur.nom,
      projetId: body.projetId || null,
      note: body.note?.trim() || undefined,
      creePar: "Don en ligne",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("invalid input value for enum")) {
      return erreur(
        "Ce type d'offrande n'est pas encore activé dans la base. Exécutez la migration supabase/migrations/0002_types_offrande.sql dans Supabase.",
        400
      );
    }
    if (message.includes("lignes")) {
      return erreur(
        "Le détail multi-contributions n'est pas encore activé dans la base. Exécutez la migration supabase/migrations/0003_lignes_offrande.sql dans Supabase.",
        400
      );
    }
    throw e;
  }

  if (body.projetId) await reinitialiserCollecte(body.projetId);

  let compteCree = false;
  const compte = body.creerCompte;
  if (compte?.email && compte.motDePasse) {
    const email = compte.email.trim().toLowerCase();
    if (EMAIL_RE.test(email) && compte.motDePasse.length >= 8) {
      const admin = creerClientAdmin();
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password: compte.motDePasse,
        email_confirm: true,
        user_metadata: {
          nom: donateur.nom,
          telephone: donateur.telephone ?? "",
          role: "membre",
          donateur_id: donateur.id,
          source: "local",
        },
      });

      if (!error && data.user) {
        const supabase = await creerClientServeur();
        await supabase.auth.signInWithPassword({
          email,
          password: compte.motDePasse,
        });
        compteCree = true;
      }
    }
  }

  return Response.json({ ok: true, operation, compteCree });
}
