# Conexão do Contraton com Supabase (Prisma)

O Prisma precisa de **uma** URL de banco. Com o Supabase, use **sempre Session mode (porta 5432)** nesta configuração. A opção "Transaction mode" (porta 6543) não funciona com `prisma migrate` e `db:seed` sem configuração extra.

---

## 1. Obter a connection string no Supabase

1. Abra o [Dashboard do Supabase](https://supabase.com/dashboard) e selecione seu projeto.
2. Vá em **Project Settings** (ícone de engrenagem) → **Database**.
3. Em **Connection string** escolha **URI**.
4. **Importante:** selecione **Session mode** (porta **5432**). Não use Transaction mode (6543) para este projeto.
5. Copie a URI. Ela deve ser parecida com:
   ```text
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
6. Substitua `[YOUR-PASSWORD]` pela **senha do banco** que você definiu ao criar o projeto (não é a senha do seu login Supabase).

---

## 2. Configurar no projeto

O arquivo `.env` fica na **raiz do app**, na mesma pasta que `package.json` e `prisma/`:

```text
c:\Users\bsbth\contratoN\contraton\.env
```

Crie ou edite o `.env` e defina **uma única linha** (tudo em uma linha, entre aspas):

```env
DATABASE_URL="postgresql://postgres.SEU_REF:SUA_SENHA@aws-0-regiao.pooler.supabase.com:5432/postgres?sslmode=require"
```

- Troque `SEU_REF`, `SUA_SENHA` e `regiao` pelos valores do seu projeto.
- A URL deve começar com `postgresql://` ou `postgres://`.
- A porta deve ser **5432** (Session), não 6543.

**Senha com caracteres especiais:** se a senha tiver `@`, `#`, `%`, `?`, etc., codifique para URL (ex.: `@` → `%40`, `#` → `%23`). Caso contrário o Prisma pode interpretar mal a URL.

---

## 3. Conferir se o Prisma enxerga a URL

No terminal, na pasta `contraton`:

```bash
cd c:\Users\bsbth\contratoN\contraton
npx prisma validate
```

Se der **"Environment variable not found: DATABASE_URL"**:

- O `.env` não está na pasta `contraton` (onde está o `prisma/schema.prisma`), ou
- O nome da variável não é exatamente `DATABASE_URL`, ou
- Há erro de digitação ou aspas quebradas (ex.: aspas curvas ou linha quebrada no meio da URL).

Corrija o `.env` e rode de novo.

---

## 4. Aplicar migrações e popular dados

Ainda na pasta `contraton`:

```bash
npx prisma migrate deploy
npm run db:seed
```

- `migrate deploy` cria as tabelas no Supabase.
- `db:seed` insere o usuário admin e os planos.

Se aparecer erro do tipo **"the URL must start with the protocol postgresql:// or postgres://"**:

- A `DATABASE_URL` está vazia, ou
- Está com valor errado (ex.: só o host, sem protocolo). A variável deve ser a URI completa, começando com `postgresql://`.

Se aparecer **erro de conexão/SSL/timeout**:

- Confirme que a porta é **5432** (Session).
- Confirme que colocou `?sslmode=require` no final da URL (Supabase exige SSL).
- Teste a mesma URI em outra ferramenta (ex.: DBeaver, TablePlus) para garantir que a senha e o projeto estão corretos.

---

## 5. Resumo rápido

| O que | Como |
|-------|------|
| Onde fica o `.env` | Na pasta `contraton`, junto de `package.json` e `prisma/` |
| Qual conexão no Supabase | **Session mode**, porta **5432** |
| Formato da URL | `postgresql://postgres.[ref]:[senha]@aws-0-[região].pooler.supabase.com:5432/postgres?sslmode=require` |
| Depois de configurar | `npx prisma migrate deploy` e `npm run db:seed` |

**Vercel:** em **Settings → Environment Variables** do projeto, adicione a mesma `DATABASE_URL` (Production/Preview). O build e o app em produção usarão essa URL.
