"use client";

import { useState } from "react";
import { buildSizeStock, getInitialSizeStock, getTotalStock, type SizeStockMap } from "@/lib/inventory";
import { formatPrice, parseNonNegativePrice } from "@/lib/price";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  sizes: string;
  sizeStock: string;
};

type Category = { id: number; name: string };

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200";

function SizeSelector({
  selectedSizes,
  onChange,
}: {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SIZE_OPTIONS.map((size) => {
        const active = selectedSizes.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() =>
              onChange(active ? selectedSizes.filter((current) => current !== size) : [...selectedSizes, size])
            }
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-black bg-black text-white"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-black"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function SizeInventoryInputs({
  selectedSizes,
  sizeStock,
  onChange,
}: {
  selectedSizes: string[];
  sizeStock: SizeStockMap;
  onChange: (next: SizeStockMap) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {selectedSizes.map((size) => (
        <label key={size} className="grid gap-1 text-sm font-semibold text-zinc-600">
          {size} stock
          <input
            type="number"
            min={0}
            value={sizeStock[size] ?? 0}
            onChange={(e) => onChange({ ...sizeStock, [size]: Number(e.target.value) })}
            className="rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal text-black outline-none focus:border-black"
          />
        </label>
      ))}
    </div>
  );
}

export function AdminProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["S", "M", "L"]);
  const [createSizeStock, setCreateSizeStock] = useState<SizeStockMap>({ S: 8, M: 8, L: 8 });

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: DEFAULT_IMAGE,
    categoryId: categories[0]?.id ?? 1,
    price: "29.99",
  });

  const [editablePrices, setEditablePrices] = useState<Record<number, string>>(
    Object.fromEntries(products.map((product) => [product.id, formatPrice(product.price)]))
  );

  const createSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  const createProduct = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsedPrice = parseNonNegativePrice(form.price);
    if (parsedPrice === null) return setError("Price must be a valid non-negative decimal.");
    if (selectedSizes.length === 0) return setError("Select at least one size.");

    const sizeStock = buildSizeStock(selectedSizes, createSizeStock);

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parsedPrice,
          sizes: selectedSizes.join(","),
          sizeStock,
        }),
      });

      const data = (await response.json()) as { product?: Product; error?: string };
      if (!response.ok || !data.product) throw new Error(data.error ?? "Create failed");

      setProducts((prev) => [data.product!, ...prev]);
      setEditablePrices((prev) => ({ ...prev, [data.product!.id]: formatPrice(data.product!.price) }));
      setForm({
        name: "",
        slug: "",
        description: "",
        imageUrl: DEFAULT_IMAGE,
        categoryId: categories[0]?.id ?? 1,
        price: "29.99",
      });
      setSelectedSizes(["S", "M", "L"]);
      setCreateSizeStock({ S: 8, M: 8, L: 8 });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = async (product: Product, patch: Partial<Product>) => {
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!response.ok) return;
    setProducts((prev) =>
      prev.map((current) => (current.id === product.id ? { ...current, ...patch } : current))
    );
  };

  const deleteProduct = async (id: number) => {
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Create product</h2>
        <p className="mt-1 text-sm text-zinc-500">Use image URLs now; wire Cloudinary/S3 upload later.</p>

        <form className="mt-6 grid gap-4" onSubmit={createProduct}>
          <div className="grid gap-3 md:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value, slug: prev.slug || createSlug(e.target.value) }))} required placeholder="Product name" className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: createSlug(e.target.value) })} required placeholder="product-slug" className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Description" className="min-h-28 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" />
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required placeholder="https://..." className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-black" />

          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })} className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black">
            {categories.map((category) => (
              <option value={category.id} key={category.id}>{category.name}</option>
            ))}
          </select>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">Available sizes</label>
            <SizeSelector
              selectedSizes={selectedSizes}
              onChange={(sizes) => {
                setSelectedSizes(sizes);
                setCreateSizeStock((prev) => buildSizeStock(sizes, prev));
              }}
            />
          </div>

          <SizeInventoryInputs selectedSizes={selectedSizes} sizeStock={createSizeStock} onChange={setCreateSizeStock} />

          <div className="grid gap-2 md:grid-cols-2">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black" required />
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">Total stock: <span className="font-bold text-black">{getTotalStock(buildSizeStock(selectedSizes, createSizeStock))}</span></div>
          </div>

          {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
          <button className="rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving}>{saving ? "Saving..." : "Create product"}</button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Inventory</h2>
        <div className="mt-6 space-y-3">
          {products.map((product) => {
            const sizeStock = getInitialSizeStock(product.sizeStock, product.sizes, product.stock);
            const sizes = Object.keys(sizeStock);

            return (
              <article key={product.id} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{product.slug}</p>
                  </div>
                  <button onClick={() => deleteProduct(product.id)} className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100">Delete</button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold text-zinc-600">Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editablePrices[product.id] ?? formatPrice(product.price)}
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal text-black outline-none focus:border-black"
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditablePrices((prev) => ({ ...prev, [product.id]: value }));
                        const parsed = parseNonNegativePrice(value);
                        if (parsed !== null) void updateProduct(product, { price: parsed });
                      }}
                    />
                  </label>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">Total stock: <span className="font-semibold text-black">{getTotalStock(sizeStock)}</span></div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {sizes.map((size) => (
                    <label key={size} className="grid gap-1 text-sm font-semibold text-zinc-600">{size} stock
                      <input
                        type="number"
                        min={0}
                        value={sizeStock[size]}
                        className="rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal text-black outline-none focus:border-black"
                        onChange={(e) => {
                          const updated = { ...sizeStock, [size]: Number(e.target.value) };
                          void updateProduct(product, {
                            sizeStock: JSON.stringify(updated),
                            sizes: sizes.join(","),
                            stock: getTotalStock(updated),
                          });
                        }}
                      />
                    </label>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
