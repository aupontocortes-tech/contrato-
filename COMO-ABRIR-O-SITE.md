# 🚀 Como Abrir o Site na Vercel

## ✅ A DATABASE_URL está configurada corretamente!

Você já fez a parte mais importante. Agora só precisa seguir estes passos:

---

## 📍 PASSO 1: Use a URL CORRETA

**❌ NÃO use estas URLs (são temporárias e podem não funcionar):**
- `contrato-git-master-thiago-s-projects-ccu0ead4.vercel.app`
- `contrato-cle665w8o-thiago-s-projects-ccd6edd4.vercel.app`

**✅ USE esta URL (é a permanente de produção):**
```
https://contrato-six.vercel.app
```

**Onde encontrar:** Vercel → Seu projeto → Overview → Domains → `contrato-six.vercel.app`

---

## 🔄 PASSO 2: Faça um Redeploy (OBRIGATÓRIO)

Depois de salvar a `DATABASE_URL`, você **DEVE** fazer um redeploy:

1. Vercel → **Deployments**
2. No último deploy, clique nos **três pontinhos** (⋯)
3. Clique em **Redeploy**
4. Aguarde ficar **Ready** (verde)

**Por quê?** Variáveis de ambiente só entram em vigor em **novos** deploys!

---

## 🧪 PASSO 3: Teste

1. Abra no navegador: `https://contrato-six.vercel.app`
2. Deve redirecionar para `/dashboard` e mostrar:
   - Menu lateral
   - Cards com estatísticas (mesmo que mostrem "...")
   - Botão "Criar novo contrato"

---

## 🔍 Se AINDA não abrir

### Teste 1: API funciona?
Abra: `https://contrato-six.vercel.app/api/version`

- ✅ Se aparecer JSON → O deploy está funcionando, problema pode ser no frontend
- ❌ Se der erro → Problema no deploy ou domínio

### Teste 2: Health check
Abra: `https://contrato-six.vercel.app/api/health`

- Mostra se `DATABASE_URL` está configurada
- Mostra se a conexão com o banco funciona
- Mostra mensagens de erro específicas

### Teste 3: Console do navegador
1. Abra `https://contrato-six.vercel.app`
2. Pressione **F12** (ou clique direito → Inspecionar)
3. Vá na aba **Console**
4. Veja se há erros em vermelho
5. Me diga quais erros aparecem

---

## ❓ Sobre domínio customizado

**NÃO é obrigatório!** O domínio `contrato-six.vercel.app` já funciona perfeitamente.

Você só precisa de um domínio customizado se quiser algo como:
- `contraton.com`
- `meusite.com.br`

Mas isso é **opcional** e não resolve o problema de "site não abrir".

---

## ✅ Checklist Final

- [ ] DATABASE_URL configurada na Vercel ✅ (você já fez!)
- [ ] Redeploy feito após salvar a variável ⚠️ (faça isso agora!)
- [ ] Usando a URL correta: `contrato-six.vercel.app` ⚠️ (não use as URLs de preview)
- [ ] Testou `/api/version` para confirmar que o deploy funciona
- [ ] Testou `/api/health` para ver status do banco

---

## 🆘 Se nada funcionar

Me envie:
1. O que aparece quando você abre `https://contrato-six.vercel.app`
2. O resultado de `https://contrato-six.vercel.app/api/health`
3. Qualquer erro do console do navegador (F12 → Console)
