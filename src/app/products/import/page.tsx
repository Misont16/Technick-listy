import { importProductsCsv } from "./actions";

export default async function ImportProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; skipped?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">Import produktů z eshopu</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Nahraj CSV export produktů z eobaly.cz (nebo administrace eshopu). Produkty se
        páruje podle SKU / kódu produktu — pokud produkt s daným SKU už existuje, jeho
        údaje se aktualizují, jinak se vytvoří nový. Chybějící technické parametry pak
        doplníš ručně na detailu produktu.
      </p>

      {params.error === "missing-file" && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          Vyber prosím CSV soubor.
        </p>
      )}
      {params.created !== undefined && (
        <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Import dokončen: {params.created} nových, {params.updated} aktualizovaných
          {Number(params.skipped) > 0
            ? `, ${params.skipped} řádků přeskočeno (chybí SKU nebo název)`
            : ""}
          .
        </p>
      )}

      <form action={importProductsCsv} className="flex flex-col gap-4">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm"
        />
        <button
          type="submit"
          className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Importovat
        </button>
      </form>

      <div className="mt-8 rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p className="mb-2 font-medium text-zinc-700">Podporované sloupce (název hlavičky nerozlišuje velikost písmen):</p>
        <p>
          SKU/kód, název, kategorie, popis, cena, obrázek (URL), materiál, hmotnost,
          délka, šířka, výška, objem, barva, země původu.
        </p>
      </div>
    </div>
  );
}
