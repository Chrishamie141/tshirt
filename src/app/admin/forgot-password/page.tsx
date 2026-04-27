export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-black text-zinc-900">Forgot Password</h1>

      <p className="mt-2 text-sm text-zinc-500">
        Enter your admin email and password reset instructions will be sent to you.
      </p>

      <form className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Email address
          </label>

          <input
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-black"
            type="email"
            placeholder="admin@tshirt.com"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-zinc-800"
        >
          Send reset link
        </button>
      </form>
    </div>
  );
}