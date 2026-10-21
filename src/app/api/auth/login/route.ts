import { EMAIL_RE, erreur, erreurConfigurationSupabase, lireBody } from "@/lib/api";
import { creerClientServeur, supabaseConfigure } from "@/lib/supabase/server";
import { trouverProfil } from "@/lib/store";

export async function POST(request: Request) {
  if (!supabaseConfigure()) return erreurConfigurationSupabase();

  const body = await lireBody<{ email?: string; motDePasse?: string }>(request);
  if (!body) return erreur("Corps de requête invalide.");

  const email = body.email?.trim() ?? "";
  const motDePasse = body.motDePasse ?? "";

  if (!EMAIL_RE.test(email) || !motDePasse)
    return erreur("E-mail et mot de passe obligatoires.");

  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });

  if (error || !data.user)
    return erreur("Identifiants incorrects.", 401);

  const profil = await trouverProfil(data.user.id);
  const utilisateur = profil
    ? { ...profil, email: data.user.email ?? email }
    : null;

  return Response.json({ ok: true, utilisateur });
}
