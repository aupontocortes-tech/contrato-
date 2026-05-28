import type { PrismaClient } from "@prisma/client";
import { isConsultoriaOnlinePlano } from "@/lib/planos";

export const PLANOS_PRESENCIAIS_ESPERADOS = [
  { nome_plano: "mensal", duracao_dias: 30, descricao: "Plano mensal (presencial)" },
  { nome_plano: "trimestral", duracao_dias: 90, descricao: "Plano trimestral (presencial)" },
  { nome_plano: "semestral", duracao_dias: 180, descricao: "Plano semestral (presencial)" },
  { nome_plano: "anual", duracao_dias: 365, descricao: "Plano anual (presencial)" },
] as const;

/** Três planos de consultoria online — sem anual/365 dias. */
export const PLANOS_ONLINE_ESPERADOS = [
  { nome_plano: "consultoria_online_mensal", duracao_dias: 30, descricao: "Consultoria online – mensal" },
  { nome_plano: "consultoria_online_trimestral", duracao_dias: 90, descricao: "Consultoria online – trimestral" },
  { nome_plano: "consultoria_online_semestral", duracao_dias: 180, descricao: "Consultoria online – semestral" },
] as const;

const NOMES_ONLINE_VALIDOS = new Set(PLANOS_ONLINE_ESPERADOS.map((p) => p.nome_plano));

export type PlanoRow = {
  id: number;
  nome_plano: string;
  duracao_dias: number;
  descricao: string | null;
};

/** Garante 4 presenciais + 3 online no banco; corrige legado de 365 dias na consultoria online. */
export async function syncPlanosNoBanco(prisma: PrismaClient): Promise<void> {
  const legado = await prisma.plano.findFirst({
    where: { nome_plano: "consultoria_online" },
  });
  if (legado) {
    const jaTemMensal = await prisma.plano.findFirst({
      where: { nome_plano: "consultoria_online_mensal" },
    });
    if (jaTemMensal && legado.id !== jaTemMensal.id) {
      await removerPlanoSeSemContratos(prisma, legado.id);
    } else {
      await prisma.plano.update({
        where: { id: legado.id },
        data: {
          nome_plano: "consultoria_online_mensal",
          duracao_dias: 30,
          descricao: "Consultoria online – mensal",
        },
      });
    }
  }

  const todosOnline = await prisma.plano.findMany({
    where: {
      OR: [
        { nome_plano: { contains: "consultoria", mode: "insensitive" } },
        { nome_plano: { contains: "online", mode: "insensitive" } },
      ],
    },
  });

  for (const p of todosOnline) {
    if (!isConsultoriaOnlinePlano(p.nome_plano)) continue;

    const esperado = PLANOS_ONLINE_ESPERADOS.find((e) => e.nome_plano === p.nome_plano);
    if (esperado) {
      if (p.duracao_dias !== esperado.duracao_dias || p.descricao !== esperado.descricao) {
        await prisma.plano.update({
          where: { id: p.id },
          data: { duracao_dias: esperado.duracao_dias, descricao: esperado.descricao },
        });
      }
      continue;
    }

    // Plano online com nome/duração incorretos (ex.: único registro 365 dias)
    if (p.duracao_dias >= 365 || p.nome_plano === "consultoria_online") {
      const ocupado = await prisma.plano.findFirst({
        where: { nome_plano: "consultoria_online_mensal" },
      });
      if (!ocupado) {
        await prisma.plano.update({
          where: { id: p.id },
          data: {
            nome_plano: "consultoria_online_mensal",
            duracao_dias: 30,
            descricao: "Consultoria online – mensal",
          },
        });
      } else {
        await removerPlanoSeSemContratos(prisma, p.id);
      }
    }
  }

  for (const esperado of [...PLANOS_PRESENCIAIS_ESPERADOS, ...PLANOS_ONLINE_ESPERADOS]) {
    const existe = await prisma.plano.findFirst({
      where: { nome_plano: esperado.nome_plano },
    });
    if (!existe) {
      await prisma.plano.create({ data: { ...esperado } });
    }
  }

  // Remove consultoria online inválida (365 dias ou nome fora do padrão), se não houver contratos
  const onlineAposSync = await prisma.plano.findMany({
    where: {
      nome_plano: { contains: "consultoria", mode: "insensitive" },
    },
  });
  for (const p of onlineAposSync) {
    if (!isConsultoriaOnlinePlano(p.nome_plano)) continue;
    const valido = NOMES_ONLINE_VALIDOS.has(p.nome_plano as (typeof PLANOS_ONLINE_ESPERADOS)[number]["nome_plano"]);
    const duracaoOk = PLANOS_ONLINE_ESPERADOS.some(
      (e) => e.nome_plano === p.nome_plano && e.duracao_dias === p.duracao_dias
    );
    if (!valido || !duracaoOk) {
      await removerPlanoSeSemContratos(prisma, p.id);
    }
  }
}

async function removerPlanoSeSemContratos(prisma: PrismaClient, planoId: number) {
  const contratos = await prisma.contrato.count({ where: { plano_id: planoId } });
  if (contratos === 0) {
    await prisma.plano.delete({ where: { id: planoId } });
  }
}

const ORDEM_PERIODICIDADE = ["mensal", "trimestral", "semestral", "anual"];

export function ordenarPlanos(planos: PlanoRow[]): PlanoRow[] {
  return [...planos].sort((a, b) => {
    const aOnline = isConsultoriaOnlinePlano(a.nome_plano) ? 1 : 0;
    const bOnline = isConsultoriaOnlinePlano(b.nome_plano) ? 1 : 0;
    if (aOnline !== bOnline) return aOnline - bOnline;
    const ia = ORDEM_PERIODICIDADE.findIndex((t) => a.nome_plano.toLowerCase().includes(t));
    const ib = ORDEM_PERIODICIDADE.findIndex((t) => b.nome_plano.toLowerCase().includes(t));
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.id - b.id;
  });
}

export function filtrarPlanosParaApp(planos: PlanoRow[]): PlanoRow[] {
  return planos.filter((p) => {
    if (!isConsultoriaOnlinePlano(p.nome_plano)) return true;
    return NOMES_ONLINE_VALIDOS.has(p.nome_plano as (typeof PLANOS_ONLINE_ESPERADOS)[number]["nome_plano"]);
  });
}
