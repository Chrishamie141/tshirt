import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";

export async function GET() {
  const all = await db.select().from(orders);
  return NextResponse.json({ orders: all });
}
