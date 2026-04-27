import OpenAI from "openai";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { products } from "@/lib/schema";
import { chatbotSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = chatbotSchema.parse(rawBody ?? {});

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

    return NextResponse.json({
      reply: response.output_text || "I can help with sizing, shipping, returns, and stock availability.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Chatbot request failed");
  }
}
