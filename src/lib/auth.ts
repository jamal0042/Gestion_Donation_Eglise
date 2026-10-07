import { cookies } from "next/headers";
import type { SessionPayload } from "./types";
import {
  SESSION_COOKIE,
  SESSION_DUREE,
  creerToken,
  verifierToken,
} from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifierToken(token);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await creerToken(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DUREE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DUREE,
  };
}
