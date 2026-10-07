import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifierToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifierToken(token) : null;
  const { pathname } = request.nextUrl;

  const next = pathname + request.nextUrl.search;

  if (pathname === "/espace" && !session) {
    return NextResponse.redirect(
      new URL(`/connexion?next=${encodeURIComponent(next)}`, request.url)
    );
  }

  if (pathname.startsWith("/tresorier")) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/connexion?next=${encodeURIComponent(next)}`, request.url)
      );
    }
    if (session.role !== "tresorier") {
      return NextResponse.redirect(new URL("/espace", request.url));
    }
  }

  if (
    (pathname === "/connexion" || pathname === "/inscription") &&
    session
  ) {
    const dest = session.role === "tresorier" ? "/tresorier" : "/espace";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tresorier/:path*", "/espace", "/connexion", "/inscription"],
};
