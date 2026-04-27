"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Ends current admin session and redirects to login.
 */
export function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        setLoading(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold hover:border-black"
      disabled={loading}
    >
      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}
