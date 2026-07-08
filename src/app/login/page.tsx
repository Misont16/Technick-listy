import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: params.callbackUrl ?? "/products",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect(`/login?error=1${params.callbackUrl ? `&callbackUrl=${encodeURIComponent(params.callbackUrl)}` : ""}`);
      }
      throw err;
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-zinc-900">
          Technické listy
        </h1>
        <p className="mb-6 text-sm text-zinc-500">eobaly.cz — přihlášení</p>

        {params.error && (
          <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            Nesprávný e-mail nebo heslo.
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            E-mail
            <input
              type="email"
              name="email"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Heslo
            <input
              type="password"
              name="password"
              required
              className="rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Přihlásit se
          </button>
        </form>
      </div>
    </div>
  );
}
