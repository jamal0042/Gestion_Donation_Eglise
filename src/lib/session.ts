import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "./types";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "secret-de-developpement-a-changer"
);

export const SESSION_COOKIE = "session";
export const SESSION_DUREE = 60 * 60 * 24 * 7;

export async function creerToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifierToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
