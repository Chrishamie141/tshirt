import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api";
import { getProductBySlug } from "@/lib/catalog";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await getProductBySlug(id);
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch product");
  }
}
