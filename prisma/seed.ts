import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@eobaly.cz";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrator";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Uzivatel ${email} uz existuje, preskakuji.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, name, passwordHash, role: "ADMIN" },
  });

  console.log(`Vytvoren admin ucet: ${email} / ${password}`);
  console.log("Po prvnim prihlaseni si heslo zmen v sekci Uzivatele.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
