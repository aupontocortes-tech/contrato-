# 🔧 Guia Completo: Configurar DATABASE_URL na Vercel

Este guia vai resolver o problema de conexão do banco na Vercel passo a passo.

---

## ⚠️ PROBLEMA (RESOLVIDO NO BUILD)

O erro que aparecia durante o **build** na Vercel:
```
Error: P1001: Can't reach database server at `aws-0-us-west-2.pooler.supabase.com:5432`
```

**O que foi feito:** O script de build **não roda mais** `prisma migrate deploy` durante o deploy. O build só executa `prisma generate` e `next build`, então não precisa acessar o banco na hora do build. O deploy na Vercel deve passar.

**O que você precisa:** Configurar `DATABASE_URL` na Vercel para a **aplicação em produção** (runtime) e rodar as migrações **uma vez** no seu ambiente (por exemplo: `npm run db:migrate` local com `DATABASE_URL` apontando para o banco de produção).

---

## ✅ SOLUÇÃO PASSO A PASSO

### PASSO 1: Pegar a URL correta no Supabase

1. **Acesse:** https://supabase.com/dashboard
2. **Clique no projeto:** "contrato" (não o "Contrato de Personal Trainer")
3. **No menu lateral esquerdo**, procure por **"Settings"** (ícone de engrenagem ⚙️) ou vá direto para:
   - Clique no ícone de engrenagem no final do menu lateral
   - Ou acesse: `https://supabase.com/dashboard/project/qwfmlrbnmnqvhlesfcuj/settings/database`

4. **Na página de Database:**
   - Role até encontrar **"Connection string"**
   - Clique na aba **"URI"**
   - **IMPORTANTE:** Selecione **"Direct connection"** (não "Session pooler")
   - Copie a URL completa que aparece

5. **A URL deve ser parecida com:**
   ```
   postgresql://postgres.qwfmlrbnmnqvhlesfcuj:[YOUR-PASSWORD]@db.qwfmlrbnmnqvhlesfcuj.supabase.co:5432/postgres
   ```

6. **Substitua `[YOUR-PASSWORD]` pela senha:** `177Thiago182`

7. **Adicione no final:** `?sslmode=require`

8. **URL final deve ficar assim:**
   ```
   postgresql://postgres.qwfmlrbnmnqvhlesfcuj:177Thiago182@db.qwfmlrbnmnqvhlesfcuj.supabase.co:5432/postgres?sslmode=require
   ```

---

### PASSO 2: Configurar na Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Clique no projeto** do Contraton
3. **Vá em:** Settings → Environment Variables
4. **Procure por:** `DATABASE_URL` (se já existir) ou clique em **"Add New"**
5. **Preencha:**
   - **Name:** `DATABASE_URL` (exatamente assim, sem espaços)
   - **Value:** Cole a URL completa que você preparou no Passo 1
   - **IMPORTANTE:** Marque todas as opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
6. **Clique em:** Save

---

### PASSO 3: Verificar se está correto

Na Vercel, após salvar, você deve ver:
- Nome: `DATABASE_URL`
- Valor: `postgresql://postgres.qwfmlrbnmnqvhlesfcuj:177Thiago182@db.qwfmlrbnmnqvhlesfcuj.supabase.co:5432/postgres?sslmode=require`
- Ambientes: Production, Preview, Development

**⚠️ ATENÇÃO:** 
- Não pode ter espaços no início ou fim
- Não pode ter quebras de linha
- Deve estar tudo em uma linha só
- Deve começar com `postgresql://`
- Deve terminar com `?sslmode=require`

---

### PASSO 4: Fazer novo deploy

1. **Na Vercel**, vá em **Deployments**
2. **Clique nos três pontinhos** (⋯) no último deploy
3. **Clique em:** Redeploy
4. **Aguarde** o build completar

---

## 🔍 SE AINDA NÃO FUNCIONAR

### Alternativa 1: Usar Session Pooler

Se a conexão direta não funcionar, tente com Session Pooler:

1. No Supabase, pegue a URL do **"Session pooler"** (não Direct)
2. Use esta URL na Vercel:
   ```
   postgresql://postgres.qwfmlrbnmnqvhlesfcuj:177Thiago182@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```

### Alternativa 2: Verificar restrições de IP

1. No Supabase: Project Settings → Database
2. Procure por "Network restrictions" ou "IP allowlist"
3. Se houver restrições, remova temporariamente ou adicione os IPs da Vercel

### Alternativa 3: Resetar senha do banco

1. No Supabase: Project Settings → Database
2. Procure por "Database password" ou "Reset database password"
3. Defina uma nova senha (anote ela!)
4. Atualize o `.env` local e a Vercel com a nova senha

---

## 📋 CHECKLIST FINAL

Antes de fazer o deploy, confirme:

- [ ] URL copiada do Supabase (Direct connection)
- [ ] `[YOUR-PASSWORD]` substituído pela senha real
- [ ] `?sslmode=require` adicionado no final
- [ ] URL colada na Vercel (Environment Variables)
- [ ] Todas as opções marcadas (Production, Preview, Development)
- [ ] Salvo na Vercel
- [ ] Novo deploy feito

---

## 🆘 AINDA COM PROBLEMAS?

Se mesmo assim não funcionar:

1. **Verifique se o projeto está ACTIVE** no Supabase (não pausado)
2. **Teste a URL localmente:**
   - Atualize o `.env` local com a mesma URL
   - Rode: `npx prisma migrate deploy`
   - Se funcionar localmente, a URL está correta
3. **Entre em contato com o suporte do Supabase** se o problema persistir

---

## 📝 NOTAS IMPORTANTES

- **Conexão Direta vs Pooler:**
  - **Direct connection:** Melhor para migrações durante o build
  - **Session pooler:** Melhor para a aplicação em produção (mas pode ter restrições)

- **Senha com caracteres especiais:**
  - Se a senha tiver `@`, `#`, `%`, `?`, etc., você precisa codificar:
    - `@` → `%40`
    - `#` → `%23`
    - `%` → `%25`
    - `?` → `%3F`

---

**Última atualização:** Este guia foi criado para resolver o erro P1001 na Vercel.
