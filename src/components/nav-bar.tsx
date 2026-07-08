import Link from "next/link";
import { signOut } from "@/auth";

export default function NavBar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: "ADMIN" | "MEMBER" };
}) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-zinc-900">
            Technické listy
          </Link>
          <Link href="/products" className="text-sm text-zinc-600 hover:text-zinc-900">
            Produkty
          </Link>
          <Link href="/products/import" className="text-sm text-zinc-600 hover:text-zinc-900">
            Import z eshopu
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/users" className="text-sm text-zinc-600 hover:text-zinc-900">
              Uživatelé
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">
            {user.name} ({user.email})
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-600 hover:text-zinc-900 underline"
            >
              Odhlásit
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
