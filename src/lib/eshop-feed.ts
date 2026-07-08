import { XMLParser } from "fast-xml-parser";
import type { ImportedRow } from "@/lib/product-import";

export const DEFAULT_FEED_URL = process.env.EOBALY_FEED_URL ?? "";

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toText(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"]).trim();
  }
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}

function parsePrice(value: unknown): number | undefined {
  const text = toText(value);
  if (!text) return undefined;
  const num = Number(text.replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isNaN(num) ? undefined : num;
}

function lastSegment(value: unknown): string | undefined {
  const text = toText(value);
  if (!text) return undefined;
  const parts = text.split(">").map((s) => s.trim());
  return parts[parts.length - 1];
}

/**
 * Parses a Google Merchant-style product feed (RSS 2.0 with the
 * http://base.google.com/ns/1.0 "g:" namespace) into ImportedRow records.
 */
export function parseGoogleFeedXml(xml: string): {
  rows: ImportedRow[];
  skipped: number;
} {
  const parser = new XMLParser({
    ignoreAttributes: true,
    removeNSPrefix: true,
    trimValues: true,
  });

  const parsed = parser.parse(xml);
  const items = toArray(parsed?.rss?.channel?.item ?? parsed?.feed?.entry);

  const rows: ImportedRow[] = [];
  let skipped = 0;

  for (const item of items) {
    const sku = toText(item.id) ?? toText(item.sku);
    const name = toText(item.title);

    if (!sku || !name) {
      skipped += 1;
      continue;
    }

    rows.push({
      sku,
      name,
      description: toText(item.description),
      price: parsePrice(item.price ?? item.sale_price),
      imageUrl: toText(item.image_link),
      sourceUrl: toText(item.link),
      category: lastSegment(item.product_type ?? item.google_product_category),
      color: toText(item.color),
      material: toText(item.material),
      weightG: parseWeightGrams(item.shipping_weight ?? item.weight),
    });
  }

  return { rows, skipped };
}

function parseWeightGrams(value: unknown): number | undefined {
  const text = toText(value);
  if (!text) return undefined;
  const match = text.match(/([\d.,]+)\s*(kg|g)?/i);
  if (!match) return undefined;
  const num = Number(match[1].replace(",", "."));
  if (Number.isNaN(num)) return undefined;
  return match[2]?.toLowerCase() === "kg" ? num * 1000 : num;
}

export async function fetchFeedProducts(
  feedUrl: string,
): Promise<{ rows: ImportedRow[]; skipped: number }> {
  const res = await fetch(feedUrl, {
    headers: { "User-Agent": "Technicke-listy-eobaly/1.0" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Feed vrátil chybu ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  return parseGoogleFeedXml(xml);
}
