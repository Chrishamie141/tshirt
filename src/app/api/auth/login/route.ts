import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { signUserToken, userCookieName } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = loginSchema.parse(rawBody);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signUserToken({ userId: user.id, email: user.email, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set(userCookieName(), token, {
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
