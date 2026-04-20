"use client";

import { MessageCircle, SendHorizontal, X } from "lucide-react";
import { FormEvent, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function ChatbotLauncher() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I can help with sizing, shipping, returns, and product availability.",
    },
  ]);

  const ask = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const next = [...messages, { role: "user" as const, content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Chat request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "No response." }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg"
      >
        {open ? <X size={16} /> : <MessageCircle size={16} />} Support
      </button>
      {open ? (
        <section className="fixed bottom-24 right-6 z-50 flex h-[460px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <header className="border-b border-zinc-200 px-4 py-3 text-sm font-semibold">Customer support</header>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  message.role === "user" ? "ml-auto bg-black text-white" : "bg-zinc-100 text-zinc-800"
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading ? <p className="text-xs text-zinc-500">Thinking...</p> : null}
          </div>
          <form className="flex gap-2 border-t border-zinc-200 p-3" onSubmit={ask}>
            <input
              className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipping, returns..."
            />
            <button className="rounded bg-black px-3 py-2 text-white" disabled={loading}>
              <SendHorizontal size={16} />
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}
