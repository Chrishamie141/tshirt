import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";

export async function GET() {
  try {
    const guard = await requireAdminSession();
    if (guard.unauthorized) return guard.unauthorized;

    const all = await db.select().from(orders);
    return NextResponse.json({ orders: all });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch orders");
  }
}
