"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const newUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/products");
  return session;
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const parsed = newUserSchema.safeParse({
    name: formData.get("name"),
    email: (formData.get("email") as string)?.toLowerCase(),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect(`/users?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Neplatná data")}`);
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/users?error=${encodeURIComponent("Uživatel s tímto e-mailem už existuje")}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { name, email, passwordHash, role } });

  revalidatePath("/users");
  redirect("/users?created=1");
}

export async function deleteUser(id: string) {
  const session = await requireAdmin();
  if (session.user.id === id) {
    redirect("/users?error=" + encodeURIComponent("Nemůžeš smazat vlastní účet"));
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
  redirect("/users");
}
