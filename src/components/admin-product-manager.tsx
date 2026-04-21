"use client";

import { useMemo, useState } from "react";
import { formatPrice, parseNonNegativePrice } from "@/lib/price";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
};

type Category = { id: number; name: string };

export function AdminProductManager({ initialProducts, categories }: { initialProducts: Product[]; categories: Category[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
    categoryId: categories[0]?.id ?? 1,
    price: "29.99",
    sizes: "S,M,L,XL",
    stock: 20,
  });

  const priceInputs = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, formatPrice(product.price)])),
    [products],
  );

  const [editablePrices, setEditablePrices] = useState<Record<number, string>>(priceInputs);

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseNonNegativePrice(form.price);
    if (parsedPrice === null) {
      setError("Price must be a valid non-negative decimal.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: parsedPrice }),
      });
      const data = (await res.json()) as { product?: Product; error?: string };
      if (!res.ok || !data.product) throw new Error(data.error ?? "Create failed");
      setProducts((prev) => [data.product!, ...prev]);
      setForm((prev) => ({ ...prev, name: "", slug: "", description: "" }));
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (product: Product, patch: Partial<Product>) => {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    setProducts((prev) => prev.map((current) => (current.id === product.id ? { ...current, ...patch } : current)));
  };

  const onPriceInputChange = (product: Product, value: string) => {
    setEditablePrices((prev) => ({ ...prev, [product.id]: value }));

    const parsedPrice = parseNonNegativePrice(value);
    if (parsedPrice === null) return;

    setError(null);
    void updateProduct(product, { price: parsedPrice });
  };

  const onPriceInputBlur = (product: Product) => {
    const value = editablePrices[product.id] ?? "";
    const parsedPrice = parseNonNegativePrice(value);

    if (parsedPrice === null) {
      setError("Price must be a valid non-negative decimal.");
      setEditablePrices((prev) => ({ ...prev, [product.id]: formatPrice(product.price) }));
      return;
    }

    setError(null);
    setEditablePrices((prev) => ({ ...prev, [product.id]: formatPrice(parsedPrice) }));
  };

  const deleteProduct = async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-bold">Create product</h2>
        <form className="mt-4 grid gap-3" onSubmit={createProduct}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Name" className="rounded border border-zinc-300 px-3 py-2" />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="Slug" className="rounded border border-zinc-300 px-3 py-2" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Description" className="rounded border border-zinc-300 px-3 py-2" />
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required placeholder="Image URL" className="rounded border border-zinc-300 px-3 py-2" />
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })} className="rounded border border-zinc-300 px-3 py-2">
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
              className="rounded border border-zinc-300 px-3 py-2"
              required
            />
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} placeholder="Stock" className="rounded border border-zinc-300 px-3 py-2" />
            <input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="Sizes" className="rounded border border-zinc-300 px-3 py-2" />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button className="rounded bg-black px-4 py-2 text-white" disabled={saving}>{saving ? "Saving..." : "Create"}</button>
        </form>
      </section>
      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-bold">Inventory</h2>
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <article key={product.id} className="rounded border border-zinc-200 p-3">
              <p className="font-semibold">{product.name}</p>
              <p className="mt-1 text-sm text-zinc-600">${formatPrice(product.price)}</p>
              <div className="mt-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editablePrices[product.id] ?? formatPrice(product.price)}
                  className="rounded border border-zinc-300 px-2 py-1"
                  onChange={(e) => onPriceInputChange(product, e.target.value)}
                  onBlur={() => onPriceInputBlur(product)}
                />
                <input type="number" value={product.stock} className="rounded border border-zinc-300 px-2 py-1" onChange={(e) => updateProduct(product, { stock: Number(e.target.value) })} />
                <button onClick={() => deleteProduct(product.id)} className="text-sm text-red-600 underline">Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
