-- Consultoria online: mensal (30), trimestral (90) e semestral (180) — sem plano de 365 dias

UPDATE "Plano"
SET
  "nome_plano" = 'consultoria_online_mensal',
  "duracao_dias" = 30,
  "descricao" = 'Consultoria online – mensal'
WHERE "nome_plano" = 'consultoria_online';

UPDATE "Plano"
SET "duracao_dias" = 180, "descricao" = 'Consultoria online – semestral'
WHERE "nome_plano" = 'consultoria_online_semestral' AND "duracao_dias" <> 180;

UPDATE "Plano"
SET "duracao_dias" = 90, "descricao" = 'Consultoria online – trimestral'
WHERE "nome_plano" = 'consultoria_online_trimestral' AND "duracao_dias" <> 90;

UPDATE "Plano"
SET "duracao_dias" = 30, "descricao" = 'Consultoria online – mensal'
WHERE "nome_plano" = 'consultoria_online_mensal' AND "duracao_dias" <> 30;

INSERT INTO "Plano" ("nome_plano", "duracao_dias", "descricao")
SELECT 'consultoria_online_mensal', 30, 'Consultoria online – mensal'
WHERE NOT EXISTS (
  SELECT 1 FROM "Plano" WHERE "nome_plano" = 'consultoria_online_mensal'
);

INSERT INTO "Plano" ("nome_plano", "duracao_dias", "descricao")
SELECT 'consultoria_online_trimestral', 90, 'Consultoria online – trimestral'
WHERE NOT EXISTS (
  SELECT 1 FROM "Plano" WHERE "nome_plano" = 'consultoria_online_trimestral'
);

INSERT INTO "Plano" ("nome_plano", "duracao_dias", "descricao")
SELECT 'consultoria_online_semestral', 180, 'Consultoria online – semestral'
WHERE NOT EXISTS (
  SELECT 1 FROM "Plano" WHERE "nome_plano" = 'consultoria_online_semestral'
);
