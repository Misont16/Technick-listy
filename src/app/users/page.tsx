import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createUser, deleteUser } from "./actions";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");

  const params = await searchParams;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Uživatelé</h1>

      {params.error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {params.error}
        </p>
      )}
      {params.created && (
        <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Kolega byl přidán.
        </p>
      )}

      <div className="mb-8 overflow-hidden rounded border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-2 font-medium">Jméno</th>
              <th className="px-4 py-2 font-medium">E-mail</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const deleteWithId = deleteUser.bind(null, u.id);
              return (
                <tr key={u.id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2 text-zinc-600">{u.email}</td>
                  <td className="px-4 py-2 text-zinc-600">
                    {u.role === "ADMIN" ? "Admin" : "Člen"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {u.id !== session.user.id && (
                      <form action={deleteWithId}>
                        <button
                          type="submit"
                          className="text-sm text-red-600 hover:underline"
                        >
                          Smazat
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-lg font-medium text-zinc-900">Přidat kolegu</h2>
      <form action={createUser} className="flex flex-col gap-4 rounded border border-zinc-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Jméno
            <input name="name" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            E-mail
            <input type="email" name="email" required className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Heslo
            <input type="password" name="password" required minLength={8} className="input" />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700">
            Role
            <select name="role" defaultValue="MEMBER" className="input">
              <option value="MEMBER">Člen</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
        </div>
        <button
          type="submit"
          className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Přidat kolegu
        </button>
      </form>
    </div>
  );
}
