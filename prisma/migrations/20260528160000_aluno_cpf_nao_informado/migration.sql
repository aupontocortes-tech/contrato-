-- CPF opcional quando marcado como não informado
ALTER TABLE "Aluno" ADD COLUMN "cpf_nao_informado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Aluno" ALTER COLUMN "cpf" DROP NOT NULL;
