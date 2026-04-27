import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { adminCookieName, signAdminToken } from "@/lib/auth";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { admins } from "@/lib/schema";
import { loginSchema } from "@/lib/validators";

/**
 * Authenticates admin credentials and creates a secure session cookie.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = loginSchema.parse(rawBody);

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
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Login failed");
  }
}
