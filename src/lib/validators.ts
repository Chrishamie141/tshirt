import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blockedPasswords = new Set(["password", "password123", "12345678", "qwerty123", "letmein123", "admin1234"]);

const strongPasswordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character")
  .refine((value) => !blockedPasswords.has(value.toLowerCase()), "Choose a stronger password");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{9,14}$/, "Phone number must be in international format");

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  email: z.string().trim().email(),
  password: strongPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(32),
  password: strongPasswordSchema
});

export const imageUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "Image URL must start with http:// or https://",
  });

export const sizeStockSchema = z.record(z.string().min(1), z.coerce.number().int().min(0));

export const adminCreateProductSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().regex(slugPattern),
  description: z.string().trim().min(10),
  imageUrl: imageUrlSchema,
  categoryId: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
  sizes: z.string().trim().min(1),
  sizeStock: sizeStockSchema.optional(),
  stock: z.coerce.number().int().min(0).optional(),
});

export const adminUpdateProductSchema = z
  .object({
    price: z.coerce.number().nonnegative().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    name: z.string().trim().min(2).optional(),
    sizeStock: sizeStockSchema.optional(),
    sizes: z.string().trim().min(1).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, "At least one field is required");

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        name: z.string().trim().min(1),
        price: z.coerce.number().positive(),
        quantity: z.coerce.number().int().positive(),
        size: z.string().trim().min(1),
      })
    )
    .min(1),
});

export const chatbotSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1),
      })
    )
    .max(30)
    .optional(),
});
