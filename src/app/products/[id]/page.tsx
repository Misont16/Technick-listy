import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/product-form";
import {
  updateProduct,
  deleteProduct,
  refreshPropertiesFromEshop,
} from "@/app/products/actions";
import type { CustomField } from "@/lib/product-schema";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; propertiesRefreshed?: string }>;
}) {
  const { id } = await params;
  const { error, propertiesRefreshed } = await searchParams;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const customFields: CustomField[] = product.customFields
    ? JSON.parse(product.customFields)
    : [];

  const updateWithId = updateProduct.bind(null, id);
  const deleteWithId = deleteProduct.bind(null, id);
  const refreshWithId = refreshPropertiesFromEshop.bind(null, id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">{product.name}</h1>
        <div className="flex items-center gap-3">
          <a
            href={`/api/products/${product.id}/datasheet`}
            className="rounded bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Stáhnout technický list (.docx)
          </a>
          <form action={deleteWithId}>
            <button
              type="submit"
              className="rounded border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              Smazat
            </button>
          </form>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {propertiesRefreshed && (
        <p className="mb-4 rounded bg-green-50 px-3 py-2 text-sm text-green-700">
          Vlastnosti produktu byly načteny z eshopu a nahradily dosavadní vlastní parametry níže.
        </p>
      )}

      <div className="mb-6 flex items-center justify-between rounded border border-zinc-200 bg-white px-4 py-3">
        <div className="text-sm text-zinc-600">
          Registrační číslo (SKU): <span className="font-medium text-zinc-900">{product.sku}</span>
          {product.sourceUrl && (
            <>
              {" "}
              ·{" "}
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                otevřít na eshopu
              </a>
            </>
          )}
        </div>
        <form action={refreshWithId}>
          <button
            type="submit"
            disabled={!product.sourceUrl}
            className="rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
            title={
              product.sourceUrl
                ? undefined
                : "Produkt nemá odkaz na eshop — synchronizuj ho nejdřív z feedu."
            }
          >
            Načíst vlastnosti z eshopu
          </button>
        </form>
      </div>

      <ProductForm
        action={updateWithId}
        submitLabel="Uložit změny"
        initial={{
          sku: product.sku,
          name: product.name,
          category: product.category ?? undefined,
          description: product.description ?? undefined,
          price: product.price,
          imageUrl: product.imageUrl ?? undefined,
          sourceUrl: product.sourceUrl ?? undefined,
          material: product.material ?? undefined,
          weightG: product.weightG,
          lengthMm: product.lengthMm,
          widthMm: product.widthMm,
          heightMm: product.heightMm,
          volumeMl: product.volumeMl,
          color: product.color ?? undefined,
          countryOfOrigin: product.countryOfOrigin ?? undefined,
          customFields,
        }}
      />
    </div>
  );
}
