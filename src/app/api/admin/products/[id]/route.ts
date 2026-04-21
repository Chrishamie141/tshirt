import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseNonNegativePrice } from "@/lib/price";
import { products } from "@/lib/schema";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json()) as Partial<{ price: number | string; stock: number; name: string }>;

  const updatePayload: Partial<{ price: number; stock: number; name: string; updatedAt: Date }> = {
    updatedAt: new Date(),
  };

  if (body.price !== undefined) {
    const parsedPrice = parseNonNegativePrice(String(body.price));
    if (parsedPrice === null) {
      return NextResponse.json({ error: "Price must be a valid non-negative decimal." }, { status: 400 });
    }
    updatePayload.price = parsedPrice;
  }

  if (body.stock !== undefined) {
    updatePayload.stock = body.stock;
  }

  if (body.name !== undefined) {
    updatePayload.name = body.name;
  }

  await db
    .update(products)
    .set(updatePayload)
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
