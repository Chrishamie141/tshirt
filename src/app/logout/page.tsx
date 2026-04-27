"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    };

    void logout();
  }, [router]);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-black">Signing you out...</h1>
      <p className="mt-2 text-sm text-zinc-500">Please wait.</p>
    </div>
  );
}
