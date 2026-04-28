import { and, asc, between, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./db";
import { categories, products } from "./schema";

export type ProductFilters = {
  category?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

const productCardSelect = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  description: products.description,
  imageUrl: products.imageUrl,
  price: products.price,
  stock: products.stock,
  sizes: products.sizes,
  sizeStock: products.sizeStock,
  categoryName: categories.name,
  categorySlug: categories.slug,
};

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

export async function getFeaturedProducts(limit = 6) {
  return db
    .select(productCardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.featured, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getHomepageProducts(limit = 6) {
  const featured = await getFeaturedProducts(limit);

  if (featured.length > 0) {
    return featured;
  }

  return db
    .select(productCardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProducts(filters: ProductFilters = {}) {
  const whereClauses = [];

  if (filters.category) {
    whereClauses.push(eq(categories.slug, filters.category));
  }

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    whereClauses.push(between(products.price, filters.minPrice, filters.maxPrice));
  } else if (filters.minPrice !== undefined) {
    whereClauses.push(gte(products.price, filters.minPrice));
  } else if (filters.maxPrice !== undefined) {
    whereClauses.push(lte(products.price, filters.maxPrice));
  }

  if (filters.size) {
    whereClauses.push(sql`${products.sizes} like ${`%${filters.size}%`}`);
  }

  if (filters.inStock) {
    whereClauses.push(gte(products.stock, 1));
  }

  return db
    .select(productCardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select(productCardSelect)
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  return product ?? null;
}