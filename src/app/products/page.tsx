import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const products = await prisma.product.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { category: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Produkty</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/products/import"
            className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Import produktů
          </Link>
          <Link
            href="/products/new"
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            + Nový produkt
          </Link>
        </div>
      </div>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Hledat podle názvu, SKU nebo kategorie..."
          className="input w-full max-w-md"
        />
      </form>

      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Zatím žádné produkty. Přidej první produkt ručně nebo naimportuj data z eshopu.
        </p>
      ) : (
        <div className="overflow-hidden rounded border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-4 py-2 font-medium">SKU</th>
                <th className="px-4 py-2 font-medium">Název</th>
                <th className="px-4 py-2 font-medium">Kategorie</th>
                <th className="px-4 py-2 font-medium">Zdroj</th>
                <th className="px-4 py-2 font-medium">Upraveno</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-2">
                    <Link href={`/products/${p.id}`} className="text-zinc-900 hover:underline">
                      {p.sku}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/products/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{p.category ?? "—"}</td>
                  <td className="px-4 py-2 text-zinc-600">
                    {p.source === "IMPORT" ? "Import" : "Ruční"}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">
                    {p.updatedAt.toLocaleDateString("cs-CZ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
