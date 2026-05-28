import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { syncPlanosNoBanco } from "../src/lib/sync-planos";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@contraton.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@contraton.com",
      senha: hash,
      tipo: "admin",
    },
  });

  await syncPlanosNoBanco(prisma);

  console.log("Seed: admin@contraton.com / admin123 e planos (incl. 3 consultoria online) sincronizados.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
