import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required and must be a PostgreSQL connection string");
}

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  bootstrapPromise: Promise<void> | undefined;
};

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

export const db = globalForDb.db ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
  globalForDb.db = db;
}

async function bootstrap() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      reset_token TEXT,
      reset_token_expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      reset_token TEXT,
      reset_token_expires_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id),
      price REAL NOT NULL,
      sizes TEXT NOT NULL DEFAULT 'S,M,L,XL',
      size_stock JSONB NOT NULL DEFAULT '{}'::jsonb,
      stock INTEGER NOT NULL DEFAULT 0,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      email TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      stripe_session_id TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      size TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `);

  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id)`);
}

const bootstrapPromise = globalForDb.bootstrapPromise ?? bootstrap();
globalForDb.bootstrapPromise = bootstrapPromise;

export async function initializeDatabase() {
  await bootstrapPromise;
}

export async function healthcheck() {
  await initializeDatabase();
  return db.execute(sql`select 1`);
}