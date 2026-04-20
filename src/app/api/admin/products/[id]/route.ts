import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Partial<{ price: number; stock: number; name: string }>;

  await db
    .update(products)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(products.id, Number(id)));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(products).where(eq(products.id, Number(id)));

  return NextResponse.json({ ok: true });
}
