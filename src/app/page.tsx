import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(3), getCategories()]);

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-800/20 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-700 px-8 py-16 text-white shadow-xl shadow-zinc-900/20">
        <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-300/20 blur-3xl" />
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-zinc-300">Spring collection</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Elevate your fit with iconic streetwear essentials.</h1>
        <p className="mt-4 max-w-xl text-zinc-200">Premium t-shirts, hoodies, and essentials. Built for comfort. Designed for movement.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 hover:-translate-y-0.5 hover:bg-amber-50">
          Shop now
        </Link>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link href="/shop" className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">View all</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={{ ...product, categoryName: "Featured" }} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Shop by category</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop/${category.slug}`} className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm shadow-zinc-200/50 hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white/95 p-8 text-center shadow-sm shadow-zinc-200/40">
        <h2 className="text-2xl font-bold">Get 10% off your first order</h2>
        <p className="mt-2 text-sm text-zinc-600">Subscribe for drops, restocks, and members-only deals.</p>
        <form className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
          <input type="email" required placeholder="you@example.com" className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" />
          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-black">Subscribe</button>
        </form>
      </section>
    </div>
  );
}
