import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TextRun,
  AlignmentType,
  BorderStyle,
} from "docx";
import type { Product } from "@prisma/client";
import type { CustomField } from "@/lib/product-schema";

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  left: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  right: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
};

function specRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: cellBorder,
        shading: { fill: "F4F4F5" },
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true })] }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: cellBorder,
        children: [new Paragraph(value)],
      }),
    ],
  });
}

export async function buildDatasheetDocx(product: Product): Promise<Buffer> {
  const customFields: CustomField[] = product.customFields
    ? JSON.parse(product.customFields)
    : [];

  const rows = [
    specRow("SKU / kód produktu", product.sku),
    ...(product.category ? [specRow("Kategorie", product.category)] : []),
    ...(product.material ? [specRow("Materiál", product.material)] : []),
    ...(product.color ? [specRow("Barva", product.color)] : []),
    ...(product.countryOfOrigin ? [specRow("Země původu", product.countryOfOrigin)] : []),
    ...(product.lengthMm ? [specRow("Délka", `${product.lengthMm} mm`)] : []),
    ...(product.widthMm ? [specRow("Šířka", `${product.widthMm} mm`)] : []),
    ...(product.heightMm ? [specRow("Výška", `${product.heightMm} mm`)] : []),
    ...(product.volumeMl ? [specRow("Objem", `${product.volumeMl} ml`)] : []),
    ...(product.weightG ? [specRow("Hmotnost", `${product.weightG} g`)] : []),
    ...(product.price ? [specRow("Cena", `${product.price} Kč`)] : []),
    ...customFields.map((f) => specRow(f.label, f.value)),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "eobaly.cz", size: 20, color: "71717A" }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.TITLE,
            children: [new TextRun({ text: "Technický list produktu" })],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({ text: product.name, bold: true, size: 28 }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
          ...(product.description
            ? [
                new Paragraph({
                  spacing: { before: 300 },
                  heading: HeadingLevel.HEADING_2,
                  children: [new TextRun("Popis")],
                }),
                new Paragraph(product.description),
              ]
            : []),
          new Paragraph({
            spacing: { before: 400 },
            children: [
              new TextRun({
                text: `Vygenerováno ${new Date().toLocaleDateString("cs-CZ")} — eobaly.cz`,
                size: 18,
                color: "A1A1AA",
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
