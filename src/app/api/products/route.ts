import { NextResponse } from "next/server";
import { getProducts } from "@/lib/catalog";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}
