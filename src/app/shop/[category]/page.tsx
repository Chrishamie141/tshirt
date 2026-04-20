import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const products = await getProducts({ category });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black capitalize">{category.replace("-", " ")}</h1>
      {products.length === 0 ? <p>No products in this category yet.</p> : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
