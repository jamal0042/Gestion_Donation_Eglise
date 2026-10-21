import { EMAIL_RE, erreur, erreurConfigurationSupabase, lireBody } from "@/lib/api";
import {
  creerClientAdmin,
  creerClientServeur,
  serviceRoleConfigure,
} from "@/lib/supabase/server";
import { trouverOuCreerDonateur, trouverProfil } from "@/lib/store";

export async function POST(request: Request) {
  if (!serviceRoleConfigure()) return erreurConfigurationSupabase();

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

  const admin = creerClientAdmin();

  const donateur = await trouverOuCreerDonateur({ nom, telephone, email });

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: motDePasse,
    email_confirm: true,
    user_metadata: {
      nom,
      telephone: telephone ?? "",
      role: "membre",
      donateur_id: donateur.id,
      source: "local",
    },
  });

  if (error || !data.user) {
    const dejaPrise = error?.message.toLowerCase().includes("already");
    return erreur(
      dejaPrise
        ? "Un compte existe déjà avec cet e-mail."
        : error?.message ?? "Impossible de créer le compte.",
      dejaPrise ? 409 : 400
    );
  }

  const supabase = await creerClientServeur();
  const { error: erreurConnexion } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (erreurConnexion) return erreur("Compte créé, veuillez vous connecter.", 201);

  const profil = await trouverProfil(data.user.id);

  return Response.json({ ok: true, utilisateur: profil });
}
