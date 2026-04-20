import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { adminCookieName, signAdminToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, body.email)).limit(1);
  if (!admin) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await bcrypt.compare(body.password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signAdminToken({ adminId: admin.id, email: admin.email });
  const cookieStore = await cookies();
  cookieStore.set(adminCookieName(), token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
