import Stripe from "stripe";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { checkoutSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const rawBody = await getJsonBody<unknown>(request);
    const body = checkoutSchema.parse(rawBody);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: body.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
      })),
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Checkout session creation failed");
  }
}
