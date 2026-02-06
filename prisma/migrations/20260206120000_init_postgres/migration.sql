-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" SERIAL NOT NULL,
    "nome_completo" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plano" (
    "id" SERIAL NOT NULL,
    "nome_plano" TEXT NOT NULL,
    "duracao_dias" INTEGER NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "Plano_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contrato" (
    "id" SERIAL NOT NULL,
    "aluno_id" INTEGER NOT NULL,
    "plano_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'gerado',
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "link_assinatura" TEXT,
    "pdf_url" TEXT,
    "assinatura_url" TEXT,
    "data_assinatura" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contrato_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_cpf_key" ON "Aluno"("cpf");

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contrato" ADD CONSTRAINT "Contrato_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "Plano"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
