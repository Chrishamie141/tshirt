"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to create account");
      router.push("/account");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-black">Create account</h1>
      <p className="mt-2 text-sm text-zinc-500">Use your account to place orders and view history.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border border-zinc-300 px-3 py-2" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-lg border border-zinc-300 px-3 py-2" type="password" minLength={8} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-60">{loading ? "Creating..." : "Create account"}</button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">Already have an account? <Link href="/login" className="hover:text-black">Login</Link></p>
    </div>
  );
}
