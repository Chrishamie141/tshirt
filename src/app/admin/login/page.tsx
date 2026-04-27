"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      if (!res.ok) {
        throw new Error(data.error ?? "Invalid email or password");
      }

      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="text-center">
        <h1 className="text-3xl font-black text-zinc-900">Admin Login</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Sign in to manage products, inventory, and orders.
        </p>
      </div>

      <form onSubmit={login} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Email address
          </label>
          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-black"
            type="email"
            placeholder="admin@tshirt.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-zinc-700">
              Password
            </label>

            <Link
              href="/admin/forgot-password"
              className="text-sm font-medium text-zinc-600 hover:text-black"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex rounded-lg border border-zinc-300 focus-within:border-black">
            <input
              className="w-full rounded-l-lg px-3 py-2 outline-none"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-sm text-zinc-500 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <button
          className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}