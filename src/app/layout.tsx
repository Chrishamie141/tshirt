import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ChatbotLauncher } from "@/components/chatbot-launcher";

export const metadata: Metadata = {
  title: "t-shirt | Modern clothing brand",
  description: "Full-stack e-commerce storefront for premium t-shirts and apparel.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full text-zinc-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-6">{children}</main>
        <ChatbotLauncher />
      </body>
    </html>
  );
}
