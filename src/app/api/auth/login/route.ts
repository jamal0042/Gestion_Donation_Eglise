import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { EMAIL_RE, erreur, lireBody, sansMotDePasse } from "@/lib/api";
import { trouverUserParEmail } from "@/lib/store";

export async function POST(request: Request) {
  const body = await lireBody<{ email?: string; motDePasse?: string }>(
    request
  );
  if (!body) return erreur("Corps de requête invalide.");

  const email = body.email?.trim() ?? "";
  const motDePasse = body.motDePasse ?? "";

  if (!EMAIL_RE.test(email) || !motDePasse)
    return erreur("E-mail et mot de passe obligatoires.");

  const user = await trouverUserParEmail(email);
  if (!user?.motDePasseHash)
    return erreur("Identifiants incorrects.", 401);

  const ok = await bcrypt.compare(motDePasse, user.motDePasseHash);
  if (!ok) return erreur("Identifiants incorrects.", 401);

  await createSession({
    sub: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    donateurId: user.donateurId,
  });

  return Response.json({ ok: true, utilisateur: sansMotDePasse(user) });
}
