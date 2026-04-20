"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";

export default function CheckoutSuccessPage() {
  const clear = useCartStore((state) => state.clear);

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <h1 className="text-3xl font-black text-emerald-900">Order confirmed 🎉</h1>
      <p className="mt-3 text-emerald-800">Thanks for your purchase. A receipt was sent to your email.</p>
      <Link href="/shop" className="mt-6 inline-block rounded bg-emerald-700 px-4 py-2 text-white">
        Continue shopping
      </Link>
    </div>
  );
}
