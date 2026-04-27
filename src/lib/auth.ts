import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "admin_session";

function secret() {
  if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in production");
  }

  return process.env.JWT_SECRET ?? "dev-secret-change-me";
}

export function signAdminToken(payload: { adminId: number; email: string }) {
  return jwt.sign(payload, secret(), { expiresIn: "12h" });
}

export function verifyAdminToken(token: string) {
  try {
    return jwt.verify(token, secret()) as { adminId: number; email: string };
  } catch {
    return null;
  }
}

/**
 * Reads admin session from httpOnly cookie and verifies JWT signature/expiration.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyAdminToken(token);
}

/**
 * Standard API auth guard for admin routes.
 */
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { session, unauthorized: null };
}

export function adminCookieName() {
  return ADMIN_COOKIE_NAME;
}
