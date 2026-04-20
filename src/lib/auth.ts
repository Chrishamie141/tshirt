import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "admin_session";

function secret() {
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

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifyAdminToken(token);
}

export function adminCookieName() {
  return ADMIN_COOKIE_NAME;
}
