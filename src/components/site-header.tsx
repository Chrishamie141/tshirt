"use client";

import Link from "next/link";
import { Shirt, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function SiteHeader() {
  const itemCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="group inline-flex items-center gap-2 rounded-full border border-transparent px-2 py-1 hover:border-amber-200 hover:bg-white">
          <Shirt size={18} className="text-zinc-700 group-hover:text-amber-700" />
          <span className="bg-gradient-to-r from-zinc-950 via-zinc-700 to-amber-700 bg-clip-text text-xl font-black tracking-tight text-transparent">
            t-shirt
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/shop" className="relative py-1 hover:text-amber-700 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-500 after:content-[''] hover:after:w-full">
            Shop
          </Link>
          <Link href="/shop/t-shirts" className="relative py-1 hover:text-amber-700 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-500 after:content-[''] hover:after:w-full">
            T-Shirts
          </Link>
          <Link href="/shop/hoodies" className="relative py-1 hover:text-amber-700 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-500 after:content-[''] hover:after:w-full">
            Hoodies
          </Link>
          <Link href="/shop/clothes" className="relative py-1 hover:text-amber-700 after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-amber-500 after:content-[''] hover:after:w-full">
            Clothes
          </Link>
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
