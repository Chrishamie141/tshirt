"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function Check({ show }: { show: boolean }) {
  return show ? <span className="absolute right-3 top-2 text-green-600">✓</span> : null;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameValid = name.trim().length >= 2;
  const phoneValid = useMemo(() => /^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, "")), [phone]);
  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);

  const passwordValid =
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const formValid = nameValid && phoneValid && emailValid && passwordValid;

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formValid) {
      setError("Please fix the highlighted fields before creating your account.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
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
        <div>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2 pr-10 ${
                name.length > 0 && nameValid ? "border-green-500" : name.length > 0 ? "border-red-400" : "border-zinc-300"
              }`}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Check show={name.length > 0 && nameValid} />
          </div>
          {name.length > 0 && !nameValid ? <p className="mt-1 text-xs text-red-600">Name must be at least 2 characters.</p> : null}
        </div>

        <div>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2 pr-10 ${
                phone.length > 0 && phoneValid ? "border-green-500" : phone.length > 0 ? "border-red-400" : "border-zinc-300"
              }`}
              type="tel"
              placeholder="+15551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Check show={phone.length > 0 && phoneValid} />
          </div>
          {phone.length > 0 && !phoneValid ? <p className="mt-1 text-xs text-red-600">Enter a valid phone number.</p> : null}
        </div>

        <div>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2 pr-10 ${
                email.length > 0 && emailValid ? "border-green-500" : email.length > 0 ? "border-red-400" : "border-zinc-300"
              }`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Check show={email.length > 0 && emailValid} />
          </div>
          {email.length > 0 && !emailValid ? <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p> : null}
        </div>

        <div>
          <div className="relative">
            <input
              className={`w-full rounded-lg border px-3 py-2 pr-20 ${
                password.length > 0 && passwordValid ? "border-green-500" : password.length > 0 ? "border-red-400" : "border-zinc-300"
              }`}
              type={showPassword ? "text" : "password"}
              minLength={12}
              placeholder="12+ chars, upper/lower/number/symbol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && passwordValid ? (
              <span className="absolute right-16 top-2 text-green-600">✓</span>
            ) : null}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-sm text-zinc-600 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {password.length > 0 && !passwordValid ? (
            <p className="mt-1 text-xs text-red-600">
              Password needs 12+ characters, uppercase, lowercase, number, and symbol.
            </p>
          ) : null}
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

        <button
          disabled={loading || !formValid}
          className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-zinc-600">
        Already have an account? <Link href="/login" className="hover:text-black">Login</Link>
      </p>
    </div>
  );
}