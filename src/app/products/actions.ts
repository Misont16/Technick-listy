"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { productSchema, type CustomField } from "@/lib/product-schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function parseCustomFields(formData: FormData): CustomField[] {
  const labels = formData.getAll("customFieldLabel[]") as string[];
  const values = formData.getAll("customFieldValue[]") as string[];
  return labels
    .map((label, i) => ({ label: label.trim(), value: (values[i] ?? "").trim() }))
    .filter((f) => f.label.length > 0);
}

function formToProductInput(formData: FormData) {
  return productSchema.parse({
    sku: formData.get("sku"),
    name: formData.get("name"),
    category: formData.get("category"),
    description: formData.get("description"),
    price: formData.get("price"),
    imageUrl: formData.get("imageUrl"),
    material: formData.get("material"),
    weightG: formData.get("weightG"),
    lengthMm: formData.get("lengthMm"),
    widthMm: formData.get("widthMm"),
    heightMm: formData.get("heightMm"),
    volumeMl: formData.get("volumeMl"),
    color: formData.get("color"),
    countryOfOrigin: formData.get("countryOfOrigin"),
    customFields: parseCustomFields(formData),
  });
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = formToProductInput(formData);

  const product = await prisma.product.create({
    data: {
      ...data,
      customFields: JSON.stringify(data.customFields),
      createdById: session.user.id,
    },
  });

  revalidatePath("/products");
  redirect(`/products/${product.id}`);
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const data = formToProductInput(formData);

  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      customFields: JSON.stringify(data.customFields),
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await prisma.product.delete({ where: { id } });
  revalidatePath("/products");
  redirect("/products");
}
