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
  ImageRun,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
} from "docx";
import type { Product } from "@prisma/client";
import type { CustomField } from "@/lib/product-schema";
import { BRAND, COMPANY, getServisbalMark, getEobalyMark } from "@/lib/branding";

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  left: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
  right: { style: BorderStyle.SINGLE, size: 2, color: "D4D4D8" },
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
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

function buildHeader(): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            type: "png",
            data: getServisbalMark(),
            transformation: { width: 22, height: 22 },
          }),
          new TextRun({ text: "  servisbal.", bold: true, color: BRAND.green, size: 30 }),
        ],
      }),
      new Paragraph({
        spacing: { before: 40 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "E4E4E7" } },
        children: [
          new TextRun({
            text: "Technický list produktu — eobaly.cz",
            size: 16,
            color: BRAND.gray,
          }),
        ],
      }),
    ],
  });
}

function buildFooter(): Footer {
  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder,
          bottom: noBorder,
          left: noBorder,
          right: noBorder,
          insideHorizontal: noBorder,
          insideVertical: noBorder,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 68, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: COMPANY.legalName, bold: true, size: 14, color: BRAND.dark }),
                      new TextRun({ text: `  |  ${COMPANY.addressLine}`, size: 14, color: BRAND.gray }),
                    ],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: COMPANY.tagline, size: 14, color: BRAND.gray })],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${COMPANY.phone}  |  ${COMPANY.email}  |  ${COMPANY.web}`,
                        size: 14,
                        color: BRAND.gray,
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `IČO: ${COMPANY.ico}  |  DIČ: ${COMPANY.dic}`,
                        size: 14,
                        color: BRAND.gray,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 32, type: WidthType.PERCENTAGE },
                borders: noBorders,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        type: "png",
                        data: getEobalyMark(),
                        transformation: { width: 18, height: 18 },
                      }),
                      new TextRun({ text: "  eobaly.cz", bold: true, size: 24, color: BRAND.dark }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "e-shop firmy SERVISBAL",
                        italics: true,
                        size: 12,
                        color: BRAND.gray,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
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
        headers: { default: buildHeader() },
        footers: { default: buildFooter() },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { before: 200 },
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
                text: `Vygenerováno ${new Date().toLocaleDateString("cs-CZ")}`,
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
