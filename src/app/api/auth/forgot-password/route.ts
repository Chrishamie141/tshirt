import crypto from "crypto";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { users } from "@/lib/schema";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = forgotPasswordSchema.parse(rawBody);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 30);
      await db
        .update(users)
        .set({ resetToken: token, resetTokenExpiresAt: expires, updatedAt: new Date() })
        .where(eq(users.id, user.id));

      const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${base}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail(user.email, resetUrl);
      } catch (emailError) {
        console.error("Failed to send password reset email", emailError);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Forgot password failed");
  }
}
