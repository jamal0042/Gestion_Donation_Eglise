import {
  creerClientServeur,
  serviceRoleConfigure,
  supabaseConfigure,
} from "./supabase/server";
import { trouverProfil } from "./store";
import type { SessionPayload, Utilisateur } from "./types";

/**
 * Récupère la session courante en vérifiant le jeton auprès de Supabase Auth.
 * `getClaims` valide la signature du JWT et rafraîchit les cookies si besoin.
 * Renvoie `null` si aucune session n'est établie ou si Supabase n'est pas
 * configuré (déploiement sans variables d'environnement).
 */
export async function getSession(): Promise<SessionPayload | null> {
  let supabase: Awaited<ReturnType<typeof creerClientServeur>>;
  try {
    supabase = await creerClientServeur();
  } catch (erreur) {
    if (!supabaseConfigure()) return null;
    throw erreur;
  }

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const sub = data.claims.sub;
  if (!sub) return null;

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "";

  let profil: Utilisateur | null = null;
  if (serviceRoleConfigure()) {
    try {
      profil = await trouverProfil(sub);
    } catch {
      profil = null;
    }
  }

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
