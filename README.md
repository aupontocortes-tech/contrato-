# Contraton

Sistema simples de gestão de contratos: cadastro de alunos, planos, geração de contrato (modelo fixo), PDF e link de assinatura.

## Início rápido

1. **Banco de dados (PostgreSQL)**  
   Crie um banco na [Supabase](https://supabase.com) (grátis):
   - Crie um projeto em https://supabase.com/dashboard
   - Em **Project Settings** → **Database** copie a **Connection string** (URI)
   - Use a opção **Transaction** (porta 5432) para migrações e seed

2. **Variáveis de ambiente**  
   Copie `.env.example` para `.env` e defina:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[SENHA]@aws-0-[região].pooler.supabase.com:5432/postgres"
   ```

3. **Migrações e seed**  
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
   Isso cria as tabelas e popula admin + planos.

3. **Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000).

4. **Login (após o seed)**  
   - **E-mail:** `admin@contraton.com`  
   - **Senha:** `admin123`

## Fluxo do aplicativo

1. Admin faz login.
2. Admin cadastra aluno (Alunos).
3. Admin cria contrato escolhendo aluno e plano (Contratos).
4. O sistema gera o texto do contrato com base em um modelo fixo (pronto para troca por IA).
5. Clique em **Gerar PDF e link** para gerar o PDF e o link de assinatura.
6. Copie o link e envie ao aluno.
7. O aluno acessa o link, abre a página de assinatura (mock) e pode marcar como assinado.
8. O status do contrato passa a **assinado** e o PDF fica disponível para download.

## Estrutura

- **Banco:** PostgreSQL (Prisma) — use Supabase, Neon ou Vercel Postgres. Tabelas: `User`, `Aluno`, `Plano`, `Contrato`.
- **Backend:** Next.js API Routes (auth, alunos, planos, contratos, gerar PDF, assinatura).
- **Frontend:** Next.js App Router, Shadcn/UI, Tailwind.
- **PDF:** pdf-lib (geração em servidor).
- **Assinatura:** Página mock em `/assinar/[id]`; preparado para integração futura com ZapSign ou Clicksign.

## Deploy na Vercel

1. Conecte o repositório ao projeto na [Vercel](https://vercel.com).
2. **Variável obrigatória:** em **Settings** → **Environment Variables** adicione:
   - **Name:** `DATABASE_URL`
   - **Value:** a connection string do PostgreSQL (ex.: Supabase, Neon). Use a mesma URI que no `.env` local (Transaction, porta 5432).
   - Marque **Production**, **Preview** e **Development** se quiser que valha para todos os ambientes.
3. Faça o deploy. O build roda apenas `prisma generate` e `next build` (não tenta conectar ao banco durante o build, evitando erro de rede na Vercel).
4. **Migrações:** Rode **uma vez** (local com `DATABASE_URL` apontando para o banco de produção, ou após o deploy):
   ```bash
   npm run db:migrate
   ```
5. **Seed:** Depois rode o seed **uma vez** no banco:
   ```bash
   npm run db:seed
   ```

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run db:migrate` — aplica migrações no banco (rode uma vez após deploy)
- `npm run db:seed` — seed (admin + planos)
- `npm run db:studio` — Prisma Studio (visualizar banco)
