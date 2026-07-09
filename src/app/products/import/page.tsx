import { importProductsFile, syncFromFeed } from "./actions";
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
    params.error === "missing-file" ? "Vyber prosím soubor." : params.error;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-xl font-semibold text-zinc-900">Import produktů</h1>
      <p className="mb-6 text-sm text-zinc-600">
        Produkty se párují podle SKU / kódu produktu — pokud produkt s daným SKU už
        existuje, jeho údaje se aktualizují, jinak se vytvoří nový.
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

      <div className="mb-6 rounded border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-base font-medium text-zinc-900">
          Excel nebo CSV s produkty
        </h2>
        <p className="mb-4 text-sm text-zinc-600">
          Nahraj soubor .xlsx nebo .csv s produkty. První řádek musí obsahovat
          názvy sloupců. Sloupce <strong>SKU/kód</strong> a <strong>název</strong> jsou
          povinné. Rozpoznané sloupce (nerozlišují velikost písmen): SKU/kód, název,
          kategorie, popis, cena, obrázek (URL), odkaz na eshop, materiál, hmotnost,
          délka, šířka, výška, objem, barva, země původu. Jakýkoliv jiný sloupec (např.
          vlastní technické parametry) se automaticky uloží jako vlastní parametr
          produktu a objeví se na technickém listu.
        </p>
        <form action={importProductsFile} className="flex flex-col gap-4">
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
      </div>

      <details className="rounded border border-zinc-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-zinc-700">
          Nebo synchronizovat z eobaly.cz
        </summary>
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-zinc-600">
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
              className="self-start rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Synchronizovat teď
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}
