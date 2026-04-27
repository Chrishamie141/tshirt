import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api";
import { getProducts } from "@/lib/catalog";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch products");
  }
}
