"use client";

import { useState } from "react";
import type { CustomField } from "@/lib/product-schema";

export type ProductFormValues = {
  sku?: string;
  name?: string;
  category?: string;
  description?: string;
  price?: number | null;
  imageUrl?: string;
  sourceUrl?: string;
  material?: string;
  weightG?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  volumeMl?: number | null;
  color?: string;
  countryOfOrigin?: string;
  customFields?: CustomField[];
};

export default function ProductForm({
  action,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  initial?: ProductFormValues;
  submitLabel: string;
}) {
  const [customFields, setCustomFields] = useState<CustomField[]>(
    initial?.customFields?.length ? initial.customFields : [],
  );

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="SKU / kód produktu *">
          <input name="sku" required defaultValue={initial?.sku} className="input" />
        </Field>
        <Field label="Název *">
          <input name="name" required defaultValue={initial?.name} className="input" />
        </Field>
        <Field label="Kategorie">
          <input name="category" defaultValue={initial?.category} className="input" />
        </Field>
        <Field label="Cena (Kč)">
          <input
            type="number"
            step="0.01"
            name="price"
            defaultValue={initial?.price ?? undefined}
            className="input"
          />
        </Field>
        <Field label="Materiál">
          <input name="material" defaultValue={initial?.material} className="input" />
        </Field>
        <Field label="Barva">
          <input name="color" defaultValue={initial?.color} className="input" />
        </Field>
        <Field label="Země původu">
          <input
            name="countryOfOrigin"
            defaultValue={initial?.countryOfOrigin}
            className="input"
          />
        </Field>
        <Field label="URL obrázku">
          <input name="imageUrl" defaultValue={initial?.imageUrl} className="input" />
        </Field>
        <Field label="Odkaz na produkt na eshopu">
          <input name="sourceUrl" defaultValue={initial?.sourceUrl} className="input" />
        </Field>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-700">Rozměry a hmotnost</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Délka (mm)">
            <input
              type="number"
              step="0.1"
              name="lengthMm"
              defaultValue={initial?.lengthMm ?? undefined}
              className="input"
            />
          </Field>
          <Field label="Šířka (mm)">
            <input
              type="number"
              step="0.1"
              name="widthMm"
              defaultValue={initial?.widthMm ?? undefined}
              className="input"
            />
          </Field>
          <Field label="Výška (mm)">
            <input
              type="number"
              step="0.1"
              name="heightMm"
              defaultValue={initial?.heightMm ?? undefined}
              className="input"
            />
          </Field>
          <Field label="Objem (ml)">
            <input
              type="number"
              step="0.1"
              name="volumeMl"
              defaultValue={initial?.volumeMl ?? undefined}
              className="input"
            />
          </Field>
          <Field label="Hmotnost (g)">
            <input
              type="number"
              step="0.1"
              name="weightG"
              defaultValue={initial?.weightG ?? undefined}
              className="input"
            />
          </Field>
        </div>
      </div>

      <Field label="Popis">
        <textarea
          name="description"
          rows={4}
          defaultValue={initial?.description}
          className="input"
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-700">
            Vlastní parametry
          </h3>
          <button
            type="button"
            onClick={() => setCustomFields((f) => [...f, { label: "", value: "" }])}
            className="text-sm text-zinc-600 underline hover:text-zinc-900"
          >
            + Přidat parametr
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {customFields.map((field, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="customFieldLabel[]"
                placeholder="Název parametru"
                defaultValue={field.label}
                className="input flex-1"
              />
              <input
                name="customFieldValue[]"
                placeholder="Hodnota"
                defaultValue={field.value}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setCustomFields((f) => f.filter((_, idx) => idx !== i))}
                className="rounded border border-zinc-300 px-3 text-sm text-zinc-600 hover:bg-zinc-100"
              >
                Odebrat
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="self-start rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-zinc-700">
      {label}
      {children}
    </label>
  );
}
