import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function GET() {
  const session = await getUserSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      name: users.name,
      phone: users.phone,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
