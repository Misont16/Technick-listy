import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/product-form";
import { updateProduct, deleteProduct } from "@/app/products/actions";
import type { CustomField } from "@/lib/product-schema";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const customFields: CustomField[] = product.customFields
    ? JSON.parse(product.customFields)
    : [];

  const updateWithId = updateProduct.bind(null, id);
  const deleteWithId = deleteProduct.bind(null, id);

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
