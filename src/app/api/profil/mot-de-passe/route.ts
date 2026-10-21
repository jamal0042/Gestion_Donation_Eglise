import { erreur, erreurConfigurationSupabase, lireBody } from "@/lib/api";
import { creerClientServeur, supabaseConfigure } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseConfigure()) return erreurConfigurationSupabase();

  const body = await lireBody<{
    ancienMotDePasse?: string;
    nouveauMotDePasse?: string;
  }>(request);
  if (!body?.nouveauMotDePasse)
    return erreur("Nouveau mot de passe obligatoire.");
  if (body.nouveauMotDePasse.length < 8)
    return erreur("Le mot de passe doit contenir au moins 8 caractères.");

  const supabase = await creerClientServeur();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return erreur("Authentification requise.", 401);

  // Vérifie l'ancien mot de passe avant de le changer.
  if (body.ancienMotDePasse) {
    const { error: erreurVerif } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: body.ancienMotDePasse,
    });
    if (erreurVerif)
      return erreur("L'ancien mot de passe est incorrect.", 400);
  }

  const { error } = await supabase.auth.updateUser({
    password: body.nouveauMotDePasse,
  });
  if (error) return erreur(error.message, 400);

  return Response.json({ ok: true });
}
