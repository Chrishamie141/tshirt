import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { buildSizeStock, getTotalStock, parseSizeStock, parseSizes } from "@/lib/inventory";
import { products } from "@/lib/schema";
import { adminUpdateProductSchema } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminSession();
    if (guard.unauthorized) return guard.unauthorized;

    const { id } = await params;
    const productId = Number(id);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const rawBody = await getJsonBody<unknown>(request);
    const body = adminUpdateProductSchema.parse(rawBody);

    const [current] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!current) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatePayload: Partial<typeof current> = { updatedAt: new Date() };

    if (body.price !== undefined) updatePayload.price = body.price;
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.sizes !== undefined) updatePayload.sizes = parseSizes(body.sizes).join(",");

    if (body.sizeStock !== undefined) {
      const sizes = parseSizes(updatePayload.sizes ?? current.sizes);
      const sizeStock = buildSizeStock(sizes, body.sizeStock);
      updatePayload.sizeStock = sizeStock;
      updatePayload.stock = getTotalStock(sizeStock);
    } else if (body.stock !== undefined) {
      const parsed = parseSizeStock(current.sizeStock);
      updatePayload.stock = body.stock;
      if (Object.keys(parsed).length === 0) {
        const sizes = parseSizes(updatePayload.sizes ?? current.sizes);
        updatePayload.sizeStock = buildSizeStock(sizes, { [sizes[0] ?? "M"]: body.stock });
      }
    }

    await db.update(products).set(updatePayload).where(eq(products.id, productId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Failed to update product");
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireAdminSession();
    if (guard.unauthorized) return guard.unauthorized;

    const { id } = await params;
    const productId = Number(id);
    if (Number.isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    await db.delete(products).where(eq(products.id, productId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toErrorResponse(error, "Failed to delete product");
  }
}
