import ProductForm from "@/components/product-form";
import { createProduct } from "@/app/products/actions";

export default function NewProductPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Nový produkt</h1>
      <ProductForm action={createProduct} submitLabel="Vytvořit produkt" />
    </div>
  );
}
