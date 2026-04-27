"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setMessage("If an account exists for that email, a reset link has been sent.");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-black">Forgot password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border border-zinc-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        <button disabled={loading} className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60">{loading ? "Sending..." : "Send reset link"}</button>
      </form>
      {message ? <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
