import { EMAIL_RE, erreur, erreurConfigurationSupabase, lireBody } from "@/lib/api";
import { creerClientServeur, supabaseConfigure } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!supabaseConfigure()) return erreurConfigurationSupabase();

  const body = await lireBody<{ email?: string }>(request);
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) return erreur("Adresse e-mail obligatoire.");

  const origine =
    process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  const supabase = await creerClientServeur();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origine}/reinitialiser`,
  });

  return Response.json({
    ok: true,
    message:
      "Si un compte est associé à cette adresse, un lien de réinitialisation vient d'être envoyé par e-mail.",
  });
}
