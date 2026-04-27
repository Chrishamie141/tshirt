import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = resetPasswordSchema.parse(rawBody);

    const now = new Date();
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.resetToken, body.token), gt(users.resetTokenExpiresAt, now)))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    await db
      .update(users)
      .set({
        passwordHash,
        resetToken: null,
        resetTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Password reset failed");
  }
}
