import { boolean, index, integer, jsonb, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";

export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    resetToken: text("reset_token"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [index("idx_admins_email").on(table.email)]
);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
    resetToken: text("reset_token"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("idx_users_email").on(table.email),
    index("idx_users_phone").on(table.phone),
    index("idx_users_reset_token").on(table.resetToken),
  ]
);

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [index("idx_categories_slug").on(table.slug)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    imageUrl: text("image_url").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    price: real("price").notNull(),
    sizes: text("sizes").notNull().default("S,M,L,XL"),
    sizeStock: jsonb("size_stock").$type<Record<string, number>>().notNull().default({}),
    stock: integer("stock").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [index("idx_products_slug").on(table.slug), index("idx_products_category_id").on(table.categoryId)]
);

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    email: text("email").notNull(),
    total: real("total").notNull(),
    status: text("status").notNull().default("pending"),
    stripeSessionId: text("stripe_session_id"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("idx_orders_email").on(table.email),
    index("idx_orders_status").on(table.status),
    index("idx_orders_user_id").on(table.userId),
    index("idx_orders_stripe_session_id").on(table.stripeSessionId),
  ]
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  size: text("size").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
