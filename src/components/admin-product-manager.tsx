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

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

function SizeSelector({
  selectedSizes,
  onChange,
}: {
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}) {
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      onChange(selectedSizes.filter((current) => current !== size));
    } else {
      onChange([...selectedSizes, size]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {SIZE_OPTIONS.map((size) => {
        const active = selectedSizes.includes(size);

        return (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
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

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
    categoryId: categories[0]?.id ?? 1,
    price: "29.99",
    stock: 20,
  });

  const priceInputs = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, formatPrice(product.price)])),
    [products]
  );

  const [editablePrices, setEditablePrices] = useState<Record<number, string>>(priceInputs);

  const createSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug ? prev.slug : createSlug(value),
    }));
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        imageUrl: String(reader.result),
      }));
      setError(null);
    };

    reader.readAsDataURL(file);
  };

  const createProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseNonNegativePrice(form.price);

    if (parsedPrice === null) {
      setError("Price must be a valid non-negative decimal.");
      return;
    }

    if (selectedSizes.length === 0) {
      setError("Select at least one size.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parsedPrice,
          sizes: selectedSizes.join(","),
        }),
      });

      const data = (await res.json()) as { product?: Product; error?: string };

      if (!res.ok || !data.product) {
        throw new Error(data.error ?? "Create failed");
      }

      setProducts((prev) => [data.product!, ...prev]);

      setForm((prev) => ({
        ...prev,
        name: "",
        slug: "",
        description: "",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
        price: "29.99",
        stock: 20,
      }));

      setSelectedSizes(["S", "M", "L"]);
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

    setProducts((prev) =>
      prev.map((current) => (current.id === product.id ? { ...current, ...patch } : current))
    );
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
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black">Create product</h2>
          <p className="mt-1 text-sm text-zinc-500">Add a new item to your store inventory.</p>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={createProduct}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Product name"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: createSlug(e.target.value) })}
              required
              placeholder="product-slug"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Description"
            className="min-h-28 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
          />

          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <label className="text-sm font-bold text-zinc-700">Product image</label>

            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Product preview"
                className="mt-3 h-44 w-full rounded-xl object-cover"
              />
            ) : null}

            <div className="mt-3 grid gap-3">
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                required
                placeholder="Paste image URL"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-black"
              />

              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-4 text-sm font-semibold text-zinc-600 transition hover:border-black hover:text-black">
                Upload image from computer
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
            className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
          >
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">Available sizes</label>
            <SizeSelector selectedSizes={selectedSizes} onChange={setSelectedSizes} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Price"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
              required
            />

            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              placeholder="Stock"
              className="rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
              required
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <button
            className="rounded-xl bg-black px-4 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? "Saving..." : "Create product"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black">Inventory</h2>
          <p className="mt-1 text-sm text-zinc-500">Quickly update price, stock, or remove items.</p>
        </div>

        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{product.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{product.slug}</p>
                </div>

                <button
                  onClick={() => deleteProduct(product.id)}
                  className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold text-zinc-600">
                  Price
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editablePrices[product.id] ?? formatPrice(product.price)}
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal text-black outline-none focus:border-black"
                    onChange={(e) => onPriceInputChange(product, e.target.value)}
                    onBlur={() => onPriceInputBlur(product)}
                  />
                </label>

                <label className="grid gap-1 text-sm font-semibold text-zinc-600">
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={product.stock}
                    className="rounded-xl border border-zinc-300 px-3 py-2 text-base font-normal text-black outline-none focus:border-black"
                    onChange={(e) => updateProduct(product, { stock: Number(e.target.value) })}
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}