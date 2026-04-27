"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const checkout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error ?? "Unable to start checkout");
      window.location.href = data.url;
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Your cart</h1>
      {items.length === 0 ? <p>Your cart is empty. Add products from the shop.</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={`${item.productId}-${item.size}`} className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 md:grid-cols-[100px_1fr_auto] md:items-center">
            <Image src={item.imageUrl} alt={item.name} width={96} height={96} className="h-24 w-24 rounded object-cover" unoptimized />
            <div>
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-sm text-zinc-500">Size {item.size}</p>
              <p className="text-sm text-zinc-700">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={item.quantity}
                min={1}
                type="number"
                className="w-16 rounded border border-zinc-300 px-2 py-1"
                onChange={(e) => updateQuantity(item.productId, item.size, Number(e.target.value))}
              />
              <button onClick={() => removeItem(item.productId, item.size)} className="text-sm text-red-600 underline">
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-lg font-bold">Subtotal: ${subtotal.toFixed(2)}</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <button
          onClick={checkout}
          disabled={items.length === 0 || loading}
          className="mt-4 rounded bg-black px-5 py-2 text-sm font-semibold text-white disabled:bg-zinc-400"
        >
          {loading ? "Redirecting..." : "Checkout with Stripe"}
        </button>
      </div>
    </div>
  );
}
