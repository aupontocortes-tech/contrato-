# Contraton

Sistema simples de gestão de contratos: cadastro de alunos, planos, geração de contrato (modelo fixo), PDF e link de assinatura.

## Início rápido

1. **Variáveis de ambiente**  
   Copie `.env.example` para `.env` (ou use o `.env` já criado com `DATABASE_URL="file:./prisma/dev.db"`).

2. **Banco de dados**  
   As migrações já foram aplicadas. Para popular o admin e os planos:
   ```bash
   npm run db:seed
   ```

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

- **Banco:** SQLite (Prisma) — tabelas `User`, `Aluno`, `Plano`, `Contrato`.
- **Backend:** Next.js API Routes (auth, alunos, planos, contratos, gerar PDF, assinatura).
- **Frontend:** Next.js App Router, Shadcn/UI, Tailwind.
- **PDF:** pdf-lib (geração em servidor).
- **Assinatura:** Página mock em `/assinar/[id]`; preparado para integração futura com ZapSign ou Clicksign.

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run db:seed` — seed (admin + planos)
- `npm run db:studio` — Prisma Studio (visualizar banco)
