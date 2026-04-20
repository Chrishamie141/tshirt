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
    <Link href={`/products/${product.slug}`} className="group overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <Image src={product.imageUrl} alt={product.name} width={600} height={450} className="h-56 w-full object-cover transition group-hover:scale-105" unoptimized />
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{product.categoryName}</p>
        <h3 className="font-semibold text-zinc-900">{product.name}</h3>
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
