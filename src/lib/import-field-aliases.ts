// Aliasy hlaviček sloupců (ceske i anglicke nazvy, ruzne exporty/tabulky)
export const FIELD_ALIASES: Record<string, string[]> = {
  sku: ["sku", "kod", "kód", "code", "product code", "katalogove cislo", "katalogové číslo"],
  name: ["name", "nazev", "název", "product name", "title"],
  category: ["category", "kategorie"],
  description: ["description", "popis", "dlouhy popis", "dlouhý popis"],
  price: ["price", "cena", "cena s dph", "cena bez dph"],
  imageUrl: ["image", "imageurl", "obrazek", "obrázek", "foto", "image url", "hlavni obrazek", "hlavní obrázek"],
  sourceUrl: ["url", "link", "odkaz", "product url", "produktova stranka", "produktová stránka"],
  material: ["material", "materiál"],
  weightG: ["weight", "hmotnost", "hmotnost (g)", "weight (g)"],
  lengthMm: ["length", "delka", "délka", "delka (mm)", "délka (mm)"],
  widthMm: ["width", "sirka", "šířka", "sirka (mm)", "šířka (mm)"],
  heightMm: ["height", "vyska", "výška", "vyska (mm)", "výška (mm)"],
  volumeMl: ["volume", "objem", "objem (ml)"],
  color: ["color", "barva"],
  countryOfOrigin: ["country", "zeme puvodu", "země původu", "country of origin"],
};

export const NUMERIC_FIELDS = new Set([
  "price",
  "weightG",
  "lengthMm",
  "widthMm",
  "heightMm",
  "volumeMl",
]);

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

/** Returns the ImportedRow field name a column header maps to, or undefined if unknown. */
export function mapHeaderToField(header: string): string | undefined {
  const normalized = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.includes(normalized)) return field;
  }
  return undefined;
}

export function parseNumeric(raw: string): number | undefined {
  const num = Number(raw.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isNaN(num) ? undefined : num;
}
