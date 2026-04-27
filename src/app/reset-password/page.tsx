"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Reset failed");
      setMessage("Password reset successful. You can now log in.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-black">Reset password</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border border-zinc-300 px-3 py-2" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" required />
        <button disabled={loading || !token} className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60">{loading ? "Updating..." : "Update password"}</button>
      </form>
      {message ? <p className="mt-4 rounded bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
