import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const rawPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const password = rawPassword.startsWith("$2b$")
    ? rawPassword
    : await bcrypt.hash(rawPassword, 10);

  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, password },
  });

  await prisma.setting.upsert({
    where: { id: "site.title" },
    update: {},
    create: { id: "site.title", value: "Afterimage" },
  });

  await prisma.setting.upsert({
    where: { id: "site.description" },
    update: {},
    create: { id: "site.description", value: "摄影作品展示与管理系统" },
  });

  await prisma.setting.upsert({
    where: { id: "site.hero_title" },
    update: {},
    create: { id: "site.hero_title", value: "光影的" },
  });

  await prisma.setting.upsert({
    where: { id: "site.hero_subtitle" },
    update: {},
    create: { id: "site.hero_subtitle", value: "残像" },
  });

  console.log("Seed completed: admin user and default settings created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
