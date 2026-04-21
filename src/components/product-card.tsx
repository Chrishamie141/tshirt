import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    categoryName: string;
    stock: number;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-sm shadow-zinc-200/40 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-zinc-300/40"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100" style={{ background: "linear-gradient(155deg, transparent 45%, rgba(255, 255, 255, 0.35) 55%, transparent 66%)" }} />
      <Image src={product.imageUrl} alt={product.name} width={600} height={450} className="h-56 w-full object-cover group-hover:scale-105" unoptimized />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{product.categoryName}</p>
        <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-950">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="font-bold">${product.price.toFixed(2)}</p>
          <p className={`text-xs ${product.stock > 0 ? "text-emerald-600" : "text-red-600"}`}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>
        </div>
      </div>
    </Link>
  );
}
