# Technické listy — eobaly.cz

Interní aplikace pro generování technických listů produktů z e-shopu eobaly.cz.
Kolegové se přihlásí, spravují produkty (ručně nebo importem z CSV) a stáhnou
technický list ve formátu **.docx** (editovatelný ve Wordu).

## Funkce

- Přihlášení kolegů (e-mail + heslo), role Admin / Člen
- Admin může přidávat a mazat uživatele (`/users`)
- Evidence produktů — název, SKU, kategorie, rozměry, hmotnost, materiál,
  cena, popis a libovolné vlastní parametry
- Import produktů z CSV exportu e-shopu (párování podle SKU, aktualizace
  existujících záznamů), ruční doplnění technických parametrů, které e-shop
  neobsahuje
- Generování technického listu produktu jako .docx ke stažení

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

Na stránce **Import z eshopu** (`/products/import`) nahraješ CSV export
produktů (např. z administrace e-shopu). Podporované sloupce (nerozlišují
velikost písmen, česky i anglicky): SKU/kód, název, kategorie, popis, cena,
obrázek, materiál, hmotnost, délka, šířka, výška, objem, barva, země
původu. Produkty se párují podle SKU — existující se aktualizují, nové se
vytvoří. Technické parametry, které e-shop neexportuje, se pak doplní ručně
na detailu produktu.

## Nasazení do provozu

- Nastav `AUTH_SECRET` na bezpečný náhodný řetězec (`openssl rand -base64 32`).
- Výchozí databáze je SQLite soubor (`prisma/dev.db`) — pro provoz na serveru
  s více instancemi zvaž přechod na Postgres (změna `provider` v
  `prisma/schema.prisma` a `DATABASE_URL`).
- `npm run build && npm run start` spustí produkční build.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + SQLite,
Auth.js (NextAuth) s přihlášením přes e-mail/heslo, knihovna `docx` pro
generování Word dokumentů, `papaparse` pro CSV import.
