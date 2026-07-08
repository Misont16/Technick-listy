import { prisma } from "@/lib/prisma";

export type ImportedRow = {
  sku: string;
  name: string;
  category?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  sourceUrl?: string;
  material?: string;
  weightG?: number;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  volumeMl?: number;
  color?: string;
  countryOfOrigin?: string;
};

export async function upsertImportedProducts(
  rows: ImportedRow[],
  actorId: string,
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = await prisma.product.findUnique({ where: { sku: row.sku } });
    if (existing) {
      await prisma.product.update({
        where: { sku: row.sku },
        data: { ...row, source: "IMPORT" },
      });
      updated += 1;
    } else {
      await prisma.product.create({
        data: { ...row, source: "IMPORT", createdById: actorId },
      });
      created += 1;
    }
  }

  return { created, updated };
}
