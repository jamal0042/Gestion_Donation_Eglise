import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

/**
 * Proxy (ex-middleware Next.js 16) : rafraîchit la session Supabase à chaque
 * requête et protège les routes privées. Il ne remplace pas l'autorisation
 * côté serveur (chaque route/route handler revérifie la session).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabase non configuré : on laisse passer (les pages afficheront l'erreur).
  if (!url || !anonKey) return response;

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [cle, valeur] of Object.entries(headers)) {
          response.headers.set(cle, valeur);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "tresorier" | "membre" | null = null;
  if (user) {
    const { data: profil } = await supabase
      .from("profils")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profil?.role ?? "membre";
  }

  const { pathname } = request.nextUrl;
  const next = pathname + request.nextUrl.search;

  if (pathname.startsWith("/espace") && !user) {
    return NextResponse.redirect(
      new URL(`/connexion?next=${encodeURIComponent(next)}`, request.url)
    );
  }

  if (pathname.startsWith("/tresorier")) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/connexion?next=${encodeURIComponent(next)}`, request.url)
      );
    }
    if (role !== "tresorier") {
      return NextResponse.redirect(new URL("/espace", request.url));
    }
  }

  if ((pathname === "/connexion" || pathname === "/inscription") && user) {
    const dest = role === "tresorier" ? "/tresorier" : "/espace";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/tresorier/:path*", "/espace/:path*", "/connexion", "/inscription"],
};

