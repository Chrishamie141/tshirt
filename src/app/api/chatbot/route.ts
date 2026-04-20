import OpenAI from "openai";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    messages?: Array<{ role: "user" | "assistant"; content: string }>;
  };

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ reply: "Support AI is offline. Please contact hello@t-shirt.com." });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const topProducts = await db
    .select({ name: products.name, stock: products.stock, sizes: products.sizes, price: products.price })
    .from(products)
    .orderBy(desc(products.stock))
    .limit(8);

  const catalogContext = topProducts
    .map((product) => `${product.name}: $${product.price} | sizes ${product.sizes} | stock ${product.stock}`)
    .join("\n");

  const lastUserMessage = body.messages?.filter((message) => message.role === "user").at(-1)?.content;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content:
          "You are a support assistant for a clothing ecommerce brand. Answer sizing, shipping, returns, and inventory questions. Keep answers concise and helpful.",
      },
      {
        role: "system",
        content: `Catalog context:\n${catalogContext}`,
      },
      {
        role: "user",
        content: lastUserMessage ?? "Say hello",
      },
    ],
    temperature: 0.3,
  });

  const text = response.output_text || "I can help with sizing, shipping, returns, and stock availability.";
  return NextResponse.json({ reply: text });
}
