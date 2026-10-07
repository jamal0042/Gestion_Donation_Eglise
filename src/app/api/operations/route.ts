import { type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, getSession } from "@/lib/auth";
import { EMAIL_RE, erreur, lireBody } from "@/lib/api";
import {
  ajouterOperation,
  ajouterUser,
  getOperations,
  getOperationsDonateur,
  reinitialiserCollecte,
  trouverOuCreerDonateur,
  trouverUserParEmail,
} from "@/lib/store";
import type { MethodePaiement, TypeOffrande } from "@/lib/types";

const TYPES: TypeOffrande[] = [
  "dime",
  "offrande",
  "don",
  "aumone",
  "cotisation",
];
const METHODES: MethodePaiement[] = [
  "especes",
  "mobile_money",
  "virement",
  "cheque",
];

export async function GET(request: NextRequest) {
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
  if (type && TYPES.includes(type as TypeOffrande)) {
    operations = operations.filter((o) => o.type === type);
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
  const body = await lireBody<{
    nom?: string;
    telephone?: string;
    email?: string;
    montant?: number;
    type?: string;
    methode?: string;
    projetId?: string | null;
    note?: string;
    date?: string;
    creerCompte?: { email?: string; motDePasse?: string };
  }>(request);

  if (!body) return erreur("Corps de requête invalide.");

  const nom = body.nom?.trim() ?? "";
  const montant = Number(body.montant);
  const type = body.type as TypeOffrande;
  const methode = body.methode as MethodePaiement;

  if (nom.length < 2) return erreur("Veuillez indiquer votre nom complet.");
  if (!Number.isFinite(montant) || montant <= 0)
    return erreur("Le montant doit être supérieur à 0.");
  if (!TYPES.includes(type)) return erreur("Type d'offrande invalide.");
  if (!METHODES.includes(methode)) return erreur("Méthode de paiement invalide.");

  const donateur = await trouverOuCreerDonateur({
    nom,
    telephone: body.telephone?.trim() || undefined,
    email: body.email?.trim() || undefined,
  });

  const operation = await ajouterOperation({
    date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
    montant,
    type,
    methode,
    donateurId: donateur.id,
    donateurNom: donateur.nom,
    projetId: body.projetId || null,
    note: body.note?.trim() || undefined,
    creePar: "Don en ligne",
  });

  if (body.projetId) await reinitialiserCollecte(body.projetId);

  let compteCree = false;
  const compte = body.creerCompte;
  if (compte?.email && compte.motDePasse) {
    const email = compte.email.trim().toLowerCase();
    if (EMAIL_RE.test(email) && compte.motDePasse.length >= 8) {
      const existant = await trouverUserParEmail(email);
      if (!existant) {
        const hash = await bcrypt.hash(compte.motDePasse, 10);
        const user = await ajouterUser({
          nom: donateur.nom,
          email,
          telephone: donateur.telephone,
          role: "membre",
          motDePasseHash: hash,
          donateurId: donateur.id,
          source: "local",
        });
        await createSession({
          sub: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          donateurId: donateur.id,
        });
        compteCree = true;
      }
    }
  }

  return Response.json({ ok: true, operation, compteCree });
}
