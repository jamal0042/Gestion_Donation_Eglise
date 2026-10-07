import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { EMAIL_RE, erreur, lireBody, sansMotDePasse } from "@/lib/api";
import { ajouterUser, trouverOuCreerDonateur, trouverUserParEmail } from "@/lib/store";

export async function POST(request: Request) {
  const body = await lireBody<{
    nom?: string;
    email?: string;
    telephone?: string;
    motDePasse?: string;
  }>(request);

  if (!body) return erreur("Corps de requête invalide.");
  const nom = body.nom?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const telephone = body.telephone?.trim();
  const motDePasse = body.motDePasse ?? "";

  if (nom.length < 2) return erreur("Veuillez indiquer votre nom complet.");
  if (!EMAIL_RE.test(email)) return erreur("Adresse e-mail invalide.");
  if (motDePasse.length < 8)
    return erreur("Le mot de passe doit contenir au moins 8 caractères.");

  const existant = await trouverUserParEmail(email);
  if (existant) return erreur("Un compte existe déjà avec cet e-mail.", 409);

  const hash = await bcrypt.hash(motDePasse, 10);
  const donateur = await trouverOuCreerDonateur({ nom, telephone, email });
  const user = await ajouterUser({
    nom,
    email,
    telephone,
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

  return Response.json({ ok: true, utilisateur: sansMotDePasse(user) });
}
