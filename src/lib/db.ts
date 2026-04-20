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

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT ''
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
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      size TEXT NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
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
