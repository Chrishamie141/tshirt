import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "file:./tshirt.db";
const sqlitePath = DATABASE_URL.replace("file:", "");

const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

function hasColumn(db: Database.Database, table: string, column: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return columns.some((entry) => entry.name === column);
}

function addColumnIfMissing(db: Database.Database, table: string, column: string, definition: string) {
  if (!hasColumn(db, table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function createTables(db: Database.Database) {
  db.exec(`
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
      sizes TEXT NOT NULL DEFAULT 'S,M,L,XL',
      size_stock TEXT NOT NULL DEFAULT '{}',
      stock INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      size TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `);

  addColumnIfMissing(db, "admins", "reset_token", "TEXT");
  addColumnIfMissing(db, "admins", "reset_token_expires_at", "INTEGER");
  addColumnIfMissing(db, "admins", "updated_at", "INTEGER NOT NULL DEFAULT 0");

  addColumnIfMissing(db, "categories", "created_at", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "categories", "updated_at", "INTEGER NOT NULL DEFAULT 0");

  addColumnIfMissing(db, "products", "size_stock", "TEXT NOT NULL DEFAULT '{}'");

  addColumnIfMissing(db, "orders", "updated_at", "INTEGER NOT NULL DEFAULT 0");

  addColumnIfMissing(db, "order_items", "created_at", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing(db, "order_items", "updated_at", "INTEGER NOT NULL DEFAULT 0");

  const now = Date.now();
  db.exec(`
    UPDATE admins SET updated_at = ${now} WHERE updated_at = 0;
    UPDATE categories SET created_at = ${now} WHERE created_at = 0;
    UPDATE categories SET updated_at = ${now} WHERE updated_at = 0;
    UPDATE orders SET updated_at = created_at WHERE updated_at = 0;
    UPDATE order_items SET created_at = ${now} WHERE created_at = 0;
    UPDATE order_items SET updated_at = created_at WHERE updated_at = 0;
  `);
}

export const sqlite =
  globalForDb.sqlite ?? new Database(sqlitePath === "./tshirt.db" ? "tshirt.db" : sqlitePath);
createTables(sqlite);

export const db = globalForDb.db ?? drizzle(sqlite, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
  globalForDb.db = db;
}

export async function healthcheck() {
  return db.run(sql`select 1`);
}
