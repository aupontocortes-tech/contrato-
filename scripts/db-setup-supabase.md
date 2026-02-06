# Conexão do ContratoN com Supabase (PostgreSQL)

## 1. Obter a connection string no Supabase

1. Abra o [Dashboard do Supabase](https://supabase.com/dashboard) e selecione seu projeto.
2. Vá em **Project Settings** (ícone de engrenagem) → **Database**.
3. Em **Connection string** escolha **URI**.
4. Use a conexão **Session mode** (porta **5432**) para o Prisma — não use a do Pooler (6543) para migrações.
5. Copie a URI e substitua `[YOUR-PASSWORD]` pela senha do banco que você definiu ao criar o projeto.

Exemplo (troque pela sua):
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## 2. Configurar no projeto

**Local (desenvolvimento):**

Crie ou edite o arquivo `.env` na raiz do projeto (`contraton/`):

```env
DATABASE_URL="postgresql://postgres.XXXXX:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

(Use sua URI real do passo 1.)

**Vercel (produção):**

1. No projeto na Vercel: **Settings** → **Environment Variables**.
2. Adicione `DATABASE_URL` com a mesma URI do Supabase (produção pode usar a mesma base ou outra).

## 3. Aplicar migrações e popular dados

Na pasta do projeto:

```bash
cd contraton
npx prisma migrate deploy
npm run db:seed
```

Isso cria as tabelas no Supabase e insere o usuário admin e os planos.

## 4. Testar a conexão

```bash
npx prisma db pull
```

Se não der erro, a conexão está ok. (Não é necessário commitar alterações do `db pull`.)

---

**Resumo:** O app usa apenas a variável `DATABASE_URL`. Com ela apontando para o Postgres do Supabase, a conexão fica feita.
