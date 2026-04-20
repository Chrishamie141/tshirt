"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@tshirt.com");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border border-zinc-200 bg-white p-8">
      <h1 className="text-2xl font-black">Admin login</h1>
      <p className="mt-1 text-sm text-zinc-500">Inventory and order management portal.</p>
      <form onSubmit={login} className="mt-5 space-y-4">
        <input className="w-full rounded border border-zinc-300 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded border border-zinc-300 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button className="w-full rounded bg-black px-4 py-2 text-white" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
