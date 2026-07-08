import fs from "fs";
import path from "path";

// Barvy odečtené z oficiálního letterhead PDF (Prohlášení o politice FSC).
export const BRAND = {
  green: "0F6433",
  eobalyGreen: "479E57",
  dark: "2B2F31",
  gray: "6B6B6B",
} as const;

export const COMPANY = {
  legalName: "SERVISBAL OBALY s.r.o.",
  addressLine: "Na Poříčí 661, 518 01 Dobruška, CZ",
  tagline: "Provozovatel e-shopu Eobaly.cz a Eobal.sk",
  phone: "+420 499 979 797",
  email: "info@servisbal.cz",
  web: "www.servisbal.cz",
  ico: "49811169",
  dic: "CZ49811169",
} as const;

let servisbalMark: Buffer | null = null;
let eobalyMark: Buffer | null = null;

export function getServisbalMark(): Buffer {
  if (!servisbalMark) {
    servisbalMark = fs.readFileSync(
      path.join(process.cwd(), "src/assets/branding/servisbal-mark.png"),
    );
  }
  return servisbalMark;
}

export function getEobalyMark(): Buffer {
  if (!eobalyMark) {
    eobalyMark = fs.readFileSync(
      path.join(process.cwd(), "src/assets/branding/eobaly-mark.png"),
    );
  }
  return eobalyMark;
}
