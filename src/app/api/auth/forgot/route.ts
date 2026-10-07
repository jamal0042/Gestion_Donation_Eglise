import { erreur, lireBody } from "@/lib/api";
import { creerResetToken, trouverUserParEmail } from "@/lib/store";

export async function POST(request: Request) {
  const body = await lireBody<{ email?: string }>(request);
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!email) return erreur("Adresse e-mail obligatoire.");

  const user = await trouverUserParEmail(email);
  let lien: string | null = null;
  if (user) {
    const token = await creerResetToken(email);
    const origine = new URL(request.url).origin;
    lien = `${origine}/reinitialiser/${token}`;
  }

  return Response.json({
    ok: true,
    message:
      "Si un compte est associé à cette adresse, un lien de réinitialisation a été généré.",
    // En production, ce lien serait envoyé par e-mail.
    lien,
  });
}
