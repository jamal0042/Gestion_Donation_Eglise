import { creerClientServeur } from "./supabase/server";
import { trouverProfil } from "./store";
import type { SessionPayload } from "./types";

/**
 * Récupère la session courante en vérifiant le jeton auprès de Supabase Auth.
 * `getClaims` valide la signature du JWT et rafraîchit les cookies si besoin.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const sub = data.claims.sub;
  if (!sub) return null;

  const profil = await trouverProfil(sub);
  const email =
    typeof data.claims.email === "string" ? data.claims.email : "";

  if (!profil) {
    return {
      sub,
      nom: email.split("@")[0] || "Utilisateur",
      email,
      role: "membre",
    };
  }

  return {
    sub: profil.id,
    nom: profil.nom,
    email,
    role: profil.role,
    donateurId: profil.donateurId,
  };
}
