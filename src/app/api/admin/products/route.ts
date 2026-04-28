import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdminSession } from "@/lib/auth";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { buildSizeStock, getTotalStock, parseSizes } from "@/lib/inventory";
import { products } from "@/lib/schema";
import { adminCreateProductSchema } from "@/lib/validators";

export async function GET() {
  try {
    const guard = await requireAdminSession();
    if (guard.unauthorized) return guard.unauthorized;

    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
    return NextResponse.json({ products: allProducts });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch products");
  }
}

export async function POST(request: Request) {
  try {
    const guard = await requireAdminSession();
    if (guard.unauthorized) return guard.unauthorized;

    const rawBody = await getJsonBody<unknown>(request);
    const body = adminCreateProductSchema.parse(rawBody);

    const sizes = parseSizes(body.sizes);
    const sizeStock = buildSizeStock(sizes, body.sizeStock ?? {});
    const now = new Date();

    const result = await db
      .insert(products)
      .values({
        ...body,
        sizes: sizes.join(","),
        sizeStock,
        stock: getTotalStock(sizeStock),
        featured: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        stock: products.stock,
        sizes: products.sizes,
        sizeStock: products.sizeStock,
      });

    return NextResponse.json({ product: result[0] });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Failed to create product");
  }
}
