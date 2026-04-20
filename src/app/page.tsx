import Link from "next/link";
import { getCategories, getFeaturedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(3), getCategories()]);

  return (
    <div className="space-y-16">
      <section className="rounded-3xl bg-gradient-to-r from-black to-zinc-700 px-8 py-16 text-white">
        <p className="mb-2 text-sm uppercase tracking-[0.2em] text-zinc-300">Spring collection</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">Elevate your fit with iconic streetwear essentials.</h1>
        <p className="mt-4 max-w-xl text-zinc-200">Premium t-shirts, hoodies, and essentials. Built for comfort. Designed for movement.</p>
        <Link href="/shop" className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black">
          Shop now
        </Link>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured products</h2>
          <Link href="/shop" className="text-sm font-semibold underline">View all</Link>
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
            <Link key={category.id} href={`/shop/${category.slug}`} className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-400">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <h2 className="text-2xl font-bold">Get 10% off your first order</h2>
        <p className="mt-2 text-sm text-zinc-600">Subscribe for drops, restocks, and members-only deals.</p>
        <form className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row">
          <input type="email" required placeholder="you@example.com" className="flex-1 rounded border border-zinc-300 px-3 py-2" />
          <button className="rounded bg-black px-4 py-2 text-white">Subscribe</button>
        </form>
      </section>
    </div>
  );
}
