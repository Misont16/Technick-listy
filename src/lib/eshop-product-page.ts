import * as cheerio from "cheerio";
import type { CustomField } from "@/lib/product-schema";

const SKIPPED_LABELS = new Set(["produkt naleznete v kategoriích"]);

function cleanText(text: string): string {
  return text.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

function capitalize(text: string): string {
  return text.length > 0 ? text[0].toUpperCase() + text.slice(1) : text;
}

/**
 * Parses the "Vlastnosti produktu" property table from an eobaly.cz
 * product detail page (structure: <h2>Vlastnosti produktu</h2> followed
 * by a <table> of <tr><td>label</td><td>value</td></tr> rows).
 */
export function scrapeProductProperties(html: string): CustomField[] {
  const $ = cheerio.load(html);

  const heading = $("h2").filter(
    (_, el) => cleanText($(el).text()).toLowerCase() === "vlastnosti produktu",
  );
  const table = heading.next("table");
  if (table.length === 0) return [];

  const fields: CustomField[] = [];

  table.find("tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 2) return;

    const label = cleanText($(cells[0]).text()).replace(/:$/, "");
    const value = cleanText($(cells[1]).text());

    if (!label || !value) return;
    if (SKIPPED_LABELS.has(label.toLowerCase())) return;

    fields.push({ label: capitalize(label), value });
  });

  return fields;
}

export async function fetchProductProperties(productUrl: string): Promise<CustomField[]> {
  const res = await fetch(productUrl, {
    headers: { "User-Agent": "Technicke-listy-eobaly/1.0" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Stránka produktu vrátila chybu ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  return scrapeProductProperties(html);
}
