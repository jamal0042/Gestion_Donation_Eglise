import type { Utilisateur } from "./types";

export type UtilisateurPublic = Utilisateur;

export async function lireBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function erreur(message: string, status = 400): Response {
  return Response.json({ erreur: message }, { status });
}

/**
 * Réponse renvoyée quand les variables d'environnement Supabase manquent
 * sur le déploiement (build ou exécution) : on évite une erreur 500 opaque.
 */
export function erreurConfigurationSupabase(): Response {
  return erreur(
    "Supabase n'est pas configuré sur ce déploiement : renseignez NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY.",
    503
  );
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
