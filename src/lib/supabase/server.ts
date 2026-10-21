import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "../database.types";

export type SupabaseServeur = Awaited<ReturnType<typeof creerClientServeur>>;

export function variablesSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase non configuré"
    );
  }
  return { url, anonKey };
}

export function supabaseConfigure() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Client Supabase côté serveur (Server Components, Route Handlers, Server
 * Actions). Il s'appuie sur les cookies de la requête pour restaurer la
 * session : il doit être recréé à chaque requête.
 */
export async function creerClientServeur() {
  const { url, anonKey } = variablesSupabase();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : les cookies ne peuvent pas y
          // être écrits. Le rafraîchissement de session est assuré par le
          // proxy, on peut donc ignorer cette erreur.
        }
      },
    },
  });
}

/**
 * Client Supabase privilégié (clé service_role). Il contourne les politiques
 * RLS : à n'utiliser que dans les routes serveur pour les opérations
 * d'écriture (don public, gestion des profils…). Ne jamais l'exposer au
 * navigateur.
 */
export function creerClientAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Clé service_role manquante : renseignez SUPABASE_SERVICE_ROLE_KEY dans .env.local."
    );
  }

  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {},
    },
  });
}
