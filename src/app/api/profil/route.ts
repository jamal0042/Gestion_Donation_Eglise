import { getSession } from "@/lib/auth";
import { EMAIL_RE, erreur, lireBody } from "@/lib/api";
import { majDonateur, majProfil, trouverProfil } from "@/lib/store";
import { creerClientAdmin } from "@/lib/supabase/server";

export async function GET() {
  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);

  const profil = await trouverProfil(session.sub);
  if (!profil) return erreur("Profil introuvable.", 404);

  return Response.json({
    utilisateur: { ...profil, email: session.email },
  });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);

  const body = await lireBody<{ nom?: string; telephone?: string }>(request);
  if (!body) return erreur("Corps de requête invalide.");

  const nom = body.nom?.trim();
  const telephone = body.telephone?.trim();

  if (nom !== undefined && nom.length < 2)
    return erreur("Veuillez indiquer votre nom complet.");

  const profil = await majProfil(session.sub, {
    ...(nom !== undefined ? { nom } : {}),
    ...(telephone !== undefined ? { telephone: telephone || null } : {}),
  });

  if (profil.donateurId) {
    await majDonateur(profil.donateurId, {
      ...(nom !== undefined ? { nom } : {}),
      ...(telephone !== undefined ? { telephone: telephone || null } : {}),
    });
  }

  return Response.json({
    ok: true,
    utilisateur: { ...profil, email: session.email },
  });
}

export async function POST(request: Request) {
  // Changement d'adresse e-mail.
  const session = await getSession();
  if (!session) return erreur("Authentification requise.", 401);

  const body = await lireBody<{ email?: string }>(request);
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) return erreur("Adresse e-mail invalide.");

  const admin = creerClientAdmin();
  const { error } = await admin.auth.admin.updateUserById(session.sub, {
    email,
    email_confirm: true,
  });
  if (error) return erreur(error.message, 400);

  if (session.donateurId) {
    await majDonateur(session.donateurId, { email });
  }

  return Response.json({ ok: true });
}
