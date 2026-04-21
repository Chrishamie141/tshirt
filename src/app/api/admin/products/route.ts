import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseNonNegativePrice } from "@/lib/price";
import { products } from "@/lib/schema";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allProducts = await db.select().from(products).orderBy(desc(products.createdAt));
  return NextResponse.json({ products: allProducts });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    categoryId: number;
    price: number | string;
    sizes: string;
    stock: number;
  };

  const parsedPrice = parseNonNegativePrice(String(body.price));
  if (parsedPrice === null) {
    return NextResponse.json({ error: "Price must be a valid non-negative decimal." }, { status: 400 });
  }

  const now = new Date();
  const result = await db
    .insert(products)
    .values({ ...body, price: parsedPrice, featured: false, createdAt: now, updatedAt: now })
    .returning({ id: products.id, name: products.name, slug: products.slug, price: products.price, stock: products.stock });

  return NextResponse.json({ product: result[0] });
}
