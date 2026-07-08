"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseProductsCsv } from "@/lib/csv-import";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function importProductsCsv(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/products/import?error=missing-file");
  }

  const csvText = await (file as File).text();
  const { rows, skipped } = parseProductsCsv(csvText);

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
        data: { ...row, source: "IMPORT", createdById: session.user.id },
      });
      created += 1;
    }
  }

  revalidatePath("/products");
  redirect(
    `/products/import?created=${created}&updated=${updated}&skipped=${skipped}`,
  );
}
