import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/schema";

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const ownOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.userId));

  const orderDetails = await Promise.all(
    ownOrders.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-3xl font-black">My account</h1>
        <p className="mt-2 text-zinc-600">Signed in as {session.email}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-black">My orders</h2>
        {orderDetails.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-600">No orders yet.</p>
        ) : (
          orderDetails.map((order) => (
            <article key={order.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="font-bold">Order #{order.id}</p>
                <p className="font-semibold">${order.total.toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-zinc-500">Status: {order.status}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded border border-zinc-100 px-3 py-2">
                    <span>{item.name} (Size {item.size}) × {item.quantity}</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
