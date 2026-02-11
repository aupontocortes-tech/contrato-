# 🔍 Como Verificar se o Banco Está Conectado

## Teste Rápido

Depois que o deploy na Vercel estiver **Ready**, abra no navegador:

```
https://contrato-six.vercel.app/api/health
```

**Se aparecer:**
```json
{
  "database_url_configured": true,
  "database_connection": true,
  "status": "ok"
}
```
✅ **Banco conectado!** O app está funcionando.

**Se aparecer:**
```json
{
  "database_url_configured": true,
  "database_connection": false,
  "status": "error",
  "message": "..."
}
```
❌ **Banco não conectado.** Veja a mensagem de erro e siga os passos abaixo.

---

## Passos para Corrigir

### 1. Verificar DATABASE_URL na Vercel

1. **Vercel** → Projeto **contrato** → **Settings** → **Environment Variables**
2. Procure por `DATABASE_URL`
3. Confirme:
   - ✅ Existe e está marcada para **Production**
   - ✅ O valor é a URL completa do Supabase (Session pooler)
   - ✅ Termina com `?sslmode=require`

### 2. Pegar a URL Correta no Supabase

1. **Supabase** → Projeto → **Settings** → **Database**
2. **Connection string** → aba **URI**
3. Selecione **"Session"** (porta 5432)
4. Copie a URL
5. Substitua `[YOUR-PASSWORD]` pela senha do banco
6. Adicione `?sslmode=require` no final

**Exemplo:**
```
postgresql://postgres.XXXXX:SENHA@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require
```

### 3. Atualizar na Vercel

1. Edite `DATABASE_URL` na Vercel
2. Cole a URL completa
3. Marque **Production**, **Preview**, **Development**
4. Clique em **Save**

### 4. Redeploy OBRIGATÓRIO

1. **Deployments** → último deploy de **Production**
2. Três pontinhos (⋯) → **Redeploy**
3. Aguarde ficar **Ready**

### 5. Testar Novamente

Abra: `https://contrato-six.vercel.app/api/health`

---

## Erros Comuns

| Erro | Solução |
|------|---------|
| `database_url_configured: false` | DATABASE_URL não está configurada na Vercel |
| `P1000` ou "auth" | Senha incorreta ou usuário errado na URL |
| `P1001` ou "timeout" | Host/porta errados ou projeto Supabase pausado |
| `connection_type: "Unknown"` | URL não é do Supabase ou formato incorreto |

---

## Importante

- **Sempre use Session pooler** (não Direct) para Vercel
- **Sempre faça Redeploy** após alterar variáveis de ambiente
- **Use a URL de produção** (`contrato-six.vercel.app`), não as URLs de preview
