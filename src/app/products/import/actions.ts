"use server";

import { auth } from "@/auth";
import { parseProductsCsv } from "@/lib/csv-import";
import { parseProductsXlsx } from "@/lib/xlsx-import";
import { fetchFeedProducts, DEFAULT_FEED_URL } from "@/lib/eshop-feed";
import { upsertImportedProducts } from "@/lib/product-import";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function syncFromFeed() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!DEFAULT_FEED_URL) {
    redirect(
      `/products/import?error=${encodeURIComponent(
        "Adresa feedu eshopu (EOBALY_FEED_URL) není nastavená.",
      )}`,
    );
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const { rows, skipped: skippedRows } = await fetchFeedProducts(DEFAULT_FEED_URL);
    skipped = skippedRows;
    const result = await upsertImportedProducts(rows, session.user.id);
    created = result.created;
    updated = result.updated;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Neznámá chyba";
    redirect(
      `/products/import?error=${encodeURIComponent(
        `Synchronizaci se nepodařilo dokončit: ${message}`,
      )}`,
    );
  }

  revalidatePath("/products");
  redirect(
    `/products/import?created=${created}&updated=${updated}&skipped=${skipped}&via=feed`,
  );
}

export async function importProductsFile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/products/import?error=missing-file");
  }

  const name = (file as File).name.toLowerCase();
  let rows;
  let skipped;

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    ({ rows, skipped } = await parseProductsXlsx(buffer));
  } else {
    const text = await (file as File).text();
    ({ rows, skipped } = parseProductsCsv(text));
  }

  const { created, updated } = await upsertImportedProducts(rows, session.user.id);

  revalidatePath("/products");
  redirect(
    `/products/import?created=${created}&updated=${updated}&skipped=${skipped}&via=file`,
  );
}
