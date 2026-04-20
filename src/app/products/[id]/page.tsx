import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { AddToCart } from "@/components/add-to-cart";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductBySlug(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Image src={product.imageUrl} alt={product.name} width={1000} height={1200} className="h-[500px] w-full rounded-xl object-cover" unoptimized />
      <div className="space-y-5">
        <p className="text-sm uppercase tracking-wide text-zinc-500">{product.categoryName}</p>
        <h1 className="text-4xl font-black">{product.name}</h1>
        <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>
        <p className="text-zinc-600">{product.description}</p>
        <AddToCart product={product} />
      </div>
    </div>
  );
}
