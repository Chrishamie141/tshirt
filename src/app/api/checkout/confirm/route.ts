import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { requireUserSession } from "@/lib/auth";
import { getJsonBody, toErrorResponse } from "@/lib/api";
import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { orderItems, orders } from "@/lib/schema";

const confirmSchema = z.object({
  sessionId: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const guard = await requireUserSession();
    if (guard.unauthorized) return guard.unauthorized;

    const rawBody = await getJsonBody<unknown>(request);
    const body = confirmSchema.parse(rawBody);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const [existing] = await db.select().from(orders).where(eq(orders.stripeSessionId, body.sessionId)).limit(1);
    if (existing) {
      return NextResponse.json({ ok: true, orderId: existing.id });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
    const session = await stripe.checkout.sessions.retrieve(body.sessionId, { expand: ["line_items"] });

    if (session.payment_status !== "paid" || !session.line_items?.data?.length) {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const createdAt = new Date();
    const [order] = await db
      .insert(orders)
      .values({
        userId: guard.session.userId,
        email: guard.session.email,
        total: (session.amount_total ?? 0) / 100,
        status: "paid",
        stripeSessionId: body.sessionId,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: orders.id, total: orders.total });

    const itemRows = session.line_items.data.map((line) => {
      const product = line.price?.product;
      const metadata = product && typeof product !== "string" && !product.deleted ? product.metadata : {};
      return {
        orderId: order.id,
        productId: Number(metadata?.productId ?? 0),
        name: line.description ?? "Item",
        quantity: line.quantity ?? 1,
        unitPrice: (line.amount_total ?? 0) / 100 / (line.quantity ?? 1),
        size: metadata?.size ?? "N/A",
        createdAt,
        updatedAt: createdAt,
      };
    });

    await db.insert(orderItems).values(itemRows);

    try {
      await sendOrderConfirmationEmail(guard.session.email, {
        id: order.id,
        total: order.total,
        items: itemRows.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
    } catch (emailError) {
      console.error("Order confirmation email failed", emailError);
    }

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    return toErrorResponse(error, "Checkout confirmation failed");
  }
}
