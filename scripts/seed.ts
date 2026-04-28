import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, initializeDatabase } from "../src/lib/db";
import { admins, categories, products } from "../src/lib/schema";

async function main() {
  await initializeDatabase();

  const now = new Date();

  await db
    .insert(categories)
    .values([
      { name: "T-Shirts", slug: "t-shirts", description: "Everyday premium tees", createdAt: now, updatedAt: now },
      { name: "Hoodies", slug: "hoodies", description: "Cozy heavyweight hoodies", createdAt: now, updatedAt: now },
      { name: "Clothes", slug: "clothes", description: "Pants, jackets, and layering", createdAt: now, updatedAt: now },
    ])
    .onConflictDoNothing({ target: categories.slug });

  const categoryRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const categoryBySlug = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

  await db
    .insert(products)
    .values([
      {
        name: "Classic Logo Tee",
        slug: "classic-logo-tee",
        description: "Soft cotton tee with subtle front logo and relaxed fit.",
        imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200",
        categoryId: categoryBySlug["t-shirts"],
        price: 29,
        sizes: "S,M,L,XL",
        sizeStock: { S: 10, M: 12, L: 9, XL: 7 },
        stock: 38,
        featured: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Oversized Street Tee",
        slug: "oversized-street-tee",
        description: "Dropped shoulders and heavyweight jersey for all-day comfort.",
        imageUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200",
        categoryId: categoryBySlug["t-shirts"],
        price: 34.99,
        sizes: "M,L,XL",
        sizeStock: { M: 8, L: 9, XL: 5 },
        stock: 22,
        featured: true,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .onConflictDoNothing({ target: products.slug });

  const existingAdmin = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, "admin@tshirt.com")).limit(1);
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash("admin1234", 10);
    await db.insert(admins).values({
      email: "admin@tshirt.com",
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log("Seed complete for PostgreSQL");
}

main().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
