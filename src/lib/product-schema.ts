import { z } from "zod";

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined || val === null ? undefined : Number(val)),
  z.number().optional(),
);

const optionalString = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().optional(),
);

export const customFieldSchema = z.object({
  label: z.string().min(1),
  value: z.string(),
});

export const productSchema = z.object({
  sku: z.string().min(1, "SKU je povinné"),
  name: z.string().min(1, "Název je povinný"),
  category: optionalString,
  description: optionalString,
  price: optionalNumber,
  imageUrl: optionalString,
  sourceUrl: optionalString,
  material: optionalString,
  weightG: optionalNumber,
  lengthMm: optionalNumber,
  widthMm: optionalNumber,
  heightMm: optionalNumber,
  volumeMl: optionalNumber,
  color: optionalString,
  countryOfOrigin: optionalString,
  customFields: z.array(customFieldSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CustomField = z.infer<typeof customFieldSchema>;
