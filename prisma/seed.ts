import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

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

  const count = await prisma.plano.count();
  if (count === 0) {
    await prisma.plano.createMany({
      data: [
        { nome_plano: "mensal", duracao_dias: 30, descricao: "Plano mensal" },
        { nome_plano: "trimestral", duracao_dias: 90, descricao: "Plano trimestral" },
        { nome_plano: "semestral", duracao_dias: 180, descricao: "Plano semestral" },
        { nome_plano: "anual", duracao_dias: 365, descricao: "Plano anual" },
        { nome_plano: "consultoria_online", duracao_dias: 365, descricao: "Consultoria online" },
      ],
    });
  }

  console.log("Seed: admin@contraton.com / admin123 e planos criados.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
