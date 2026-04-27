import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName } from "@/lib/auth";

/**
 * Clears the admin session cookie to log the user out.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName(), "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
