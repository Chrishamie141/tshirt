import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAdminSession, requireUserSession } from "@/lib/auth";
import { toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/schema";

export async function GET() {
  try {
    const admin = await getAdminSession();

    if (admin) {
      const all = await db.select().from(orders);
      return NextResponse.json({ orders: all });
    }

    const guard = await requireUserSession();
    if (guard.unauthorized) return guard.unauthorized;

    const ownOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, guard.session.userId));

    const withItems = await Promise.all(
      ownOrders.map(async (order) => {
        const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
        return { ...order, items };
      })
    );

    return NextResponse.json({ orders: withItems });
  } catch (error) {
    return toErrorResponse(error, "Failed to fetch orders");
  }
}
