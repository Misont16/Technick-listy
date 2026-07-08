import { importProductsCsv, syncFromFeed } from "./actions";
import { DEFAULT_FEED_URL } from "@/lib/eshop-feed";

export default async function ImportProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    updated?: string;
    skipped?: string;
    error?: string;
    via?: string;
  }>;
}) {
  const params = await searchParams;

  const errorMessage =
    params.error === "missing-file" ? "Vyber prosím CSV soubor." : params.error;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">Produkty z eshopu</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Produkty se párují podle SKU / kódu produktu — pokud produkt s daným SKU už
        existuje, jeho základní údaje se aktualizují, jinak se vytvoří nový. Technické
        parametry, které eshop neuvádí (materiál, přesné rozměry apod.), pak doplníš
        ručně na detailu produktu.
      </p>

      {errorMessage && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
      {params.created !== undefined && (
        <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          {params.via === "feed" ? "Synchronizace z eshopu dokončena" : "Import dokončen"}:{" "}
          {params.created} nových, {params.updated} aktualizovaných
          {Number(params.skipped) > 0
            ? `, ${params.skipped} položek přeskočeno (chybí SKU nebo název)`
            : ""}
          .
        </p>
      )}

      <div className="mb-8 rounded border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-base font-medium text-zinc-900">
          Synchronizovat z eobaly.cz
        </h2>
        <p className="mb-4 text-sm text-zinc-600">
          Načte aktuální produkty přímo z produktového feedu eshopu.
          {DEFAULT_FEED_URL ? (
            <>
              {" "}
              Zdroj: <code className="text-xs text-zinc-500">{DEFAULT_FEED_URL}</code>
            </>
          ) : (
            " Adresa feedu není nastavená (EOBALY_FEED_URL v .env)."
          )}
        </p>
        <form action={syncFromFeed}>
          <button
            type="submit"
            disabled={!DEFAULT_FEED_URL}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Synchronizovat teď
          </button>
        </form>
      </div>

      <details className="rounded border border-zinc-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">
          Nebo nahrát CSV ručně
        </summary>
        <div className="mt-4 flex flex-col gap-4">
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
              className="self-start rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Importovat CSV
            </button>
          </form>
          <p className="text-sm text-zinc-600">
            Podporované sloupce (nerozlišují velikost písmen): SKU/kód, název,
            kategorie, popis, cena, obrázek (URL), odkaz na eshop, materiál,
            hmotnost, délka, šířka, výška, objem, barva, země původu.
          </p>
        </div>
      </details>
    </div>
  );
}
