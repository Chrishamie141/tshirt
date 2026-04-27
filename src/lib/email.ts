type EmailOrderItem = {
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

type EmailOrder = {
  id: number;
  total: number;
  items: EmailOrderItem[];
};

function fromAddress() {
  return process.env.EMAIL_FROM ?? "onboarding@resend.dev";
}

async function sendEmail(to: string, subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY missing; skipping email send");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error: ${response.status} ${body}`);
  }
}

export async function sendOrderConfirmationEmail(to: string, order: EmailOrder) {
  const rows = order.items
    .map((item) => `${item.name} — Size ${item.size} × ${item.quantity} ($${item.unitPrice.toFixed(2)})`)
    .join("\n");

  await sendEmail(
    to,
    `Order #${order.id} confirmation`,
    `Thanks for your order!\n\nOrder ID: ${order.id}\n\nItems:\n${rows}\n\nTotal: $${order.total.toFixed(
      2
    )}\n\nWe are preparing your order now.`
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail(
    to,
    "Reset your password",
    `Use this secure link to reset your password: ${resetUrl}\n\nIf you didn't request this, you can ignore this email.`
  );
}
