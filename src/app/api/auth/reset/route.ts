import bcrypt from "bcryptjs";
import { erreur, lireBody } from "@/lib/api";
import { modifierMotDePasse, utiliserResetToken } from "@/lib/store";

export async function POST(request: Request) {
  const body = await lireBody<{ token?: string; motDePasse?: string }>(
    request
  );
  if (!body?.token || !body.motDePasse)
    return erreur("Jeton et nouveau mot de passe obligatoires.");
  if (body.motDePasse.length < 8)
    return erreur("Le mot de passe doit contenir au moins 8 caractères.");

  const email = await utiliserResetToken(body.token);
  if (!email)
    return erreur("Lien invalide ou expiré. Demandez-en un nouveau.", 400);

  const hash = await bcrypt.hash(body.motDePasse, 10);
  const ok = await modifierMotDePasse(email, hash);
  if (!ok) return erreur("Compte introuvable.", 404);

  return Response.json({ ok: true });
}
