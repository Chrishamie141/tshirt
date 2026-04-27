import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/api";
import { getCategories } from "@/lib/catalog";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch categories");
  }
}
