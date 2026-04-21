"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="bg-gradient-to-r from-zinc-950 via-zinc-700 to-amber-700 bg-clip-text text-xl font-black tracking-tight text-transparent">
          t-shirt
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/shop" className="hover:text-amber-700">Shop</Link>
          <Link href="/shop/t-shirts" className="hover:text-amber-700">T-Shirts</Link>
          <Link href="/shop/hoodies" className="hover:text-amber-700">Hoodies</Link>
          <Link href="/shop/clothes" className="hover:text-amber-700">Clothes</Link>
          <Link href="/cart" className="relative inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1 hover:border-amber-200 hover:bg-white">
            <ShoppingCart size={18} />
            Cart
            {itemCount > 0 ? (
              <span className="absolute -right-4 -top-2 rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white shadow-md shadow-zinc-400/40">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
