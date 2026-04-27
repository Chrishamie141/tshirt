import bcrypt from "bcryptjs";
import Database from "better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:./tshirt.db";
const sqlitePath = databaseUrl.replace("file:", "") || "tshirt.db";
const sqlite = new Database(sqlitePath);

sqlite.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  reset_token TEXT,
  reset_token_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  price REAL NOT NULL,
  sizes TEXT NOT NULL,
  size_stock TEXT NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`);

const now = Date.now();

const insertCategory = sqlite.prepare(
  "INSERT OR IGNORE INTO categories (name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
);

insertCategory.run("T-Shirts", "t-shirts", "Everyday premium tees", now, now);
insertCategory.run("Hoodies", "hoodies", "Cozy heavyweight hoodies", now, now);
insertCategory.run("Clothes", "clothes", "Pants, jackets, and layering", now, now);

const categoryRows = sqlite.prepare("SELECT id, slug FROM categories").all() as Array<{ id: number; slug: string }>;
const categoryBySlug = Object.fromEntries(categoryRows.map((row) => [row.slug, row.id]));

const insertProduct = sqlite.prepare(`
  INSERT OR IGNORE INTO products
  (name, slug, description, image_url, category_id, price, sizes, size_stock, stock, featured, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

[
  [
    "Classic Logo Tee",
    "classic-logo-tee",
    "Soft cotton tee with subtle front logo and relaxed fit.",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200",
    categoryBySlug["t-shirts"],
    29.0,
    "S,M,L,XL",
    JSON.stringify({ S: 10, M: 12, L: 9, XL: 7 }),
    38,
    1,
  ],
  [
    "Oversized Street Tee",
    "oversized-street-tee",
    "Dropped shoulders and heavyweight jersey for all-day comfort.",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200",
    categoryBySlug["t-shirts"],
    34.99,
    "M,L,XL",
    JSON.stringify({ M: 8, L: 9, XL: 5 }),
    22,
    1,
  ],
].forEach((product) => insertProduct.run(...product, now, now));

const passwordHash = await bcrypt.hash("admin1234", 10);

const insertAdmin = sqlite.prepare(`
  INSERT OR IGNORE INTO admins
  (email, password_hash, created_at, updated_at)
  VALUES (?, ?, ?, ?)
`);
insertAdmin.run("admin@tshirt.com", passwordHash, now, now);

console.log(`Seed complete at ${sqlitePath}`);
sqlite.close();
