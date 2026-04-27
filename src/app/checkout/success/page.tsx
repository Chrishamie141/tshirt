"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export default function CheckoutSuccessPage() {
  const clear = useCartStore((state) => state.clear);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("Confirming your order...");

  useEffect(() => {
    const run = async () => {
      clear();
      if (!sessionId) {
        setStatus("Order confirmed.");
        return;
      }

      try {
        const response = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          throw new Error(data.error ?? "Order confirmation pending.");
        }

        setStatus("Order confirmed and emailed 🎉");
      } catch (error) {
        console.error("Checkout confirmation failed", error);
        setStatus("Payment succeeded. We are finalizing your order now.");
      }
    };

    void run();
  }, [clear, sessionId]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <h1 className="text-3xl font-black text-emerald-900">Order confirmed 🎉</h1>
      <p className="mt-3 text-emerald-800">{status}</p>
      <Link href="/account" className="mt-6 mr-3 inline-block rounded bg-zinc-900 px-4 py-2 text-white">
        View account
      </Link>
      <Link href="/shop" className="mt-6 inline-block rounded bg-emerald-700 px-4 py-2 text-white">
        Continue shopping
      </Link>
    </div>
  );
}
