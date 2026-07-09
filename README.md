# Technické listy — eobaly.cz

Interní aplikace pro generování technických listů produktů z e-shopu eobaly.cz.
Kolegové se přihlásí, produkty se synchronizují přímo z eshopu (nebo zadají
ručně) a stáhnou technický list ve formátu **.docx** (editovatelný ve Wordu)
se sjednoceným záhlavím a zápatím na každé straně.

## Funkce

- Přihlášení kolegů (e-mail + heslo), role Admin / Člen
- Admin může přidávat a mazat uživatele (`/users`)
- Evidence produktů — název, SKU, kategorie, rozměry, hmotnost, materiál,
  cena, popis, odkaz na eshop a libovolné vlastní parametry
- Synchronizace produktů přímo z produktového feedu eobaly.cz (párování podle
  SKU, aktualizace existujících záznamů), ruční doplnění technických
  parametrů, které feed neobsahuje; CSV import zůstává jako záložní ruční
  varianta
- Generování technického listu produktu jako .docx ke stažení, se stejným
  záhlavím (logo servisbal.) a zápatím (kontaktní údaje SERVISBAL OBALY
  s.r.o. + eobaly.cz) na každé stránce

## Požadavky

- Node.js 20+
- npm

## První spuštění

```bash
npm install

# vytvoří .env, pokud ještě neexistuje — uprav AUTH_SECRET na náhodný řetězec
cp .env.example .env

# vytvoří SQLite databázi a aplikuje migrace
npm run db:migrate

# vytvoří prvního admin účtu (výchozí admin@eobaly.cz / changeme123)
npm run db:seed

npm run dev
```

Aplikace poběží na http://localhost:3000. Po prvním přihlášení doporučujeme
v sekci **Uživatelé** vytvořit účty kolegům a smazat/přehesovat výchozí admin
účet.

Vlastní přihlašovací údaje prvního admina lze nastavit před seedem:

```bash
SEED_ADMIN_EMAIL=jmeno@eobaly.cz SEED_ADMIN_PASSWORD=silne-heslo SEED_ADMIN_NAME="Jméno Příjmení" npm run db:seed
```

## Import produktů z e-shopu

Na stránce **Produkty z eshopu** (`/products/import`) je tlačítko
**Synchronizovat teď**, které stáhne aktuální produkty přímo z veřejného
produktového feedu eobaly.cz (adresa v `EOBALY_FEED_URL`, výchozí
`https://www.eobaly.cz/google_1457.xml` — Google Merchant XML formát).
Produkty se párují podle SKU (`g:id`) — existující se aktualizují, nové se
vytvoří. Feed obsahuje jen základní údaje (název, popis, cena, obrázek,
kategorie, odkaz) — technické parametry jako materiál nebo přesné rozměry se
doplní ručně na detailu produktu.

Jako záloha (např. když feed neobsahuje potřebný sloupec, nebo pro jednorázový
import odjinud) je pod tím k dispozici i ruční nahrání CSV se stejnou logikou
párování podle SKU.

### Vlastnosti produktu (technické parametry)

Feed obsahuje jen základní údaje (název, popis, cena, obrázek, kategorie,
odkaz na eshop). Přesné technické parametry — vnější/vnitřní rozměr,
materiál, druh lepenky, FEFCO, paletizace EUR/US, hmotnost, celní
nomenklaturu apod. — eshop zobrazuje v tabulce "Vlastnosti produktu" přímo
na stránce produktu. Tlačítko **Načíst vlastnosti z eshopu** na detailu
produktu (`src/lib/eshop-product-page.ts`) tuto tabulku stáhne a naparsuje
přímo ze stránky produktu (pomocí jejího `sourceUrl` získaného z feedu) a
uloží jako vlastní parametry produktu — přesně v pořadí a se stejnými
popisky, jaké má eshop. Tím se technický list váže na SKU (registrační
číslo) produktu a obsahuje stejné vlastnosti, jaké vidí zákazník na webu.

Toto tlačítko načítá jen jeden produkt najednou (aby se předešlo
timeoutu při hromadném stahování desítek stránek) — hodí se spustit až
u konkrétního produktu, pro který zrovna generuješ technický list.

> **Pozn.:** V sandboxované vývojové session, ve které tato appka vznikla,
> je odchozí síťový přístup na `eobaly.cz` blokovaný, takže synchronizaci
> z feedu i stahování stránky produktu nešlo živě otestovat proti reálným
> datům — ověřil jsem to proti lokálnímu mock serveru s HTML, které mi
> poskytl zadavatel (skutečná struktura tabulky "Vlastnosti produktu" z
> `eobaly.cz`), a proti standardnímu formátu Google Merchant XML feedů.
> Po nasazení na server s běžným internetovým přístupem doporučuji obě
> funkce vyzkoušet na reálném produktu a zkontrolovat, že se pole mapují
> správně.

## Záhlaví a zápatí technického listu

Vzhled vychází z poskytnutého firemního dokumentu (Prohlášení o politice
FSC). Barvy (zelená `#0F6433`, tmavá `#2B2F31`) jsou odečtené přímo z PDF,
loga v `src/assets/branding/` jsou zjednodušenou rekonstrukcí (ne pixelově
identická kopie originálních log) — pokud máš oficiální PNG/SVG loga
servisbal. a Eobaly.cz, stačí jimi nahradit soubory `servisbal-mark.png` a
`eobaly-mark.png` ve stejném adresáři. Záhlaví a zápatí definuje
`src/lib/datasheet.ts` a `src/lib/branding.ts` a je stejné na každé
vygenerované stránce každého technického listu.

## Nasazení do provozu

- Nastav `AUTH_SECRET` na bezpečný náhodný řetězec (`openssl rand -base64 32`).
- Výchozí databáze je SQLite soubor (`prisma/dev.db`) — pro provoz na serveru
  s více instancemi zvaž přechod na Postgres (změna `provider` v
  `prisma/schema.prisma` a `DATABASE_URL`).
- `npm run build && npm run start` spustí produkční build.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite,
Auth.js (NextAuth) s přihlášením přes e-mail/heslo, knihovna `docx` pro
generování Word dokumentů, `fast-xml-parser` pro čtení produktového feedu,
`papaparse` pro záložní CSV import.
