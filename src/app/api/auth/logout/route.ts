import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { userCookieName } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(userCookieName(), "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
