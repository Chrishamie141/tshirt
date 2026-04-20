"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="text-xl font-black tracking-tight">
          t-shirt
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/shop">Shop</Link>
          <Link href="/shop/t-shirts">T-Shirts</Link>
          <Link href="/shop/hoodies">Hoodies</Link>
          <Link href="/shop/clothes">Clothes</Link>
          <Link href="/cart" className="relative inline-flex items-center gap-2">
            <ShoppingCart size={18} />
            Cart
            {itemCount > 0 ? (
              <span className="absolute -right-4 -top-2 rounded-full bg-black px-1.5 py-0.5 text-[10px] text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
