import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, orders, products } from "@/lib/schema";
import { AdminProductManager } from "@/components/admin-product-manager";
import { AdminLogoutButton } from "@/components/admin-logout-button";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [allProducts, allCategories, allOrders] = await Promise.all([
    db.select({ id: products.id, name: products.name, slug: products.slug, price: products.price, stock: products.stock, sizes: products.sizes, sizeStock: products.sizeStock }).from(products),
    db.select({ id: categories.id, name: categories.name }).from(categories),
    db.select().from(orders).where(eq(orders.status, "paid")),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-black">Admin dashboard</h1>
        <AdminLogoutButton />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Products</p>
          <p className="text-3xl font-black">{allProducts.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Paid orders</p>
          <p className="text-3xl font-black">{allOrders.length}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-500">Revenue</p>
          <p className="text-3xl font-black">${allOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
        </div>
      </div>
      <AdminProductManager initialProducts={allProducts} categories={allCategories} />
    </div>
  );
}
