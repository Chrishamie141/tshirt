import Link from "next/link";
import { getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ size?: string; min?: string; max?: string; inStock?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    size: params.size,
    minPrice: params.min ? Number(params.min) : undefined,
    maxPrice: params.max ? Number(params.max) : undefined,
    inStock: params.inStock === "1",
  };

  const [products, categories] = await Promise.all([getProducts(filters), getCategories()]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">Shop</h1>
      <form className="grid gap-3 rounded-xl border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-200/40 md:grid-cols-4">
        <input name="size" placeholder="Size (S, M, L...)" defaultValue={params.size} className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" />
        <input name="min" type="number" step="0.01" placeholder="Min price" defaultValue={params.min} className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" />
        <input name="max" type="number" step="0.01" placeholder="Max price" defaultValue={params.max} className="rounded-lg border border-zinc-300 px-3 py-2 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-100" />
        <label className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm">
          <input type="checkbox" name="inStock" value="1" defaultChecked={params.inStock === "1"} /> In stock only
        </label>
        <button className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black md:col-span-4">Apply filters</button>
      </form>
      <div className="flex flex-wrap gap-2 text-sm">
        {categories.map((category) => (
          <Link className="rounded-full border border-zinc-300 bg-white/80 px-3 py-1 hover:border-amber-300 hover:bg-amber-50" key={category.id} href={`/shop/${category.slug}`}>
            {category.name}
          </Link>
        ))}
      </div>
      {products.length === 0 ? <p className="rounded bg-amber-50 p-4 text-amber-800">No products found with those filters.</p> : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
