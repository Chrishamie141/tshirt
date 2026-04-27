import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { signUserToken, userCookieName } from "@/lib/auth";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = signupSchema.parse(rawBody);

    const [existing] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, body.email), eq(users.phone, body.phone)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Invalid signup details" }, { status: 400 });
    }

    const now = new Date();
    const hashed = await bcrypt.hash(body.password, 12);
    const [created] = await db
      .insert(users)
      .values({
        name: body.name,
        phone: body.phone,
        email: body.email,
        passwordHash: hashed,
        role: "user",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    const token = signUserToken({ userId: created.id, email: created.email, role: created.role });
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

    return toErrorResponse(error, "Signup failed");
  }
}
