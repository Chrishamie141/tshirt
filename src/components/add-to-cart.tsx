"use client";

import { useMemo, useState } from "react";
import { getInitialSizeStock } from "@/lib/inventory";
import { useCartStore } from "@/store/cart-store";

type AddToCartProps = {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    imageUrl: string;
    sizes: string;
    sizeStock: string | Record<string, number>;
    stock: number;
  };
};

export function AddToCart({ product }: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const sizeStock = useMemo(
    () => getInitialSizeStock(product.sizeStock, product.sizes, product.stock),
    [product.sizeStock, product.sizes, product.stock]
  );
  const availableSizes = Object.keys(sizeStock);
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] ?? "M");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedSizeStock = Math.max(0, sizeStock[selectedSize] ?? 0);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-4">
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Size</label>
        <select
          value={selectedSize}
          onChange={(e) => {
            setSelectedSize(e.target.value);
            setQuantity(1);
          }}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        >
          {availableSizes.map((size) => (
            <option key={size} value={size}>
              {size} ({sizeStock[size] ?? 0} left)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">Quantity</label>
        <input
          type="number"
          min={1}
          max={Math.max(1, selectedSizeStock)}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
      </div>
      <button
        disabled={selectedSizeStock < 1}
        onClick={handleAdd}
        className="w-full rounded bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {added ? "Added!" : selectedSizeStock < 1 ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
