import type { Utilisateur } from "./types";

export type UtilisateurPublic = Omit<Utilisateur, "motDePasseHash">;

export function sansMotDePasse(user: Utilisateur): UtilisateurPublic {
  const copie = { ...user };
  delete copie.motDePasseHash;
  return copie;
}

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

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
