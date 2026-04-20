"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="font-bold text-red-900">Something went wrong</h2>
      <p className="text-sm text-red-700">{error.message}</p>
      <button onClick={reset} className="mt-3 rounded bg-red-700 px-3 py-1.5 text-sm text-white">
        Try again
      </button>
    </div>
  );
}
