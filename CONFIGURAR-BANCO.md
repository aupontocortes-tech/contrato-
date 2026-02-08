# O que configurar para o aplicativo rodar com o banco de dados

Este guia explica **tudo o que você precisa fazer na mão** para o Contraton usar um banco de dados de verdade (alunos, planos e contratos salvos). Não é preciso ser desenvolvedor: basta seguir os passos.

---

## Em resumo: o que você vai fazer

1. **Criar uma conta e um projeto no Supabase** (serviço de banco de dados na nuvem, gratuito para começar).
2. **Pegar a “senha de conexão”** do banco e colar em um arquivo chamado `.env` dentro da pasta do projeto.
3. **Rodar dois comandos** no terminal (copiar e colar) para criar as tabelas e carregar os dados iniciais (planos e usuário admin).

Depois disso, o aplicativo vai rodar “de verdade” com o banco: tudo que você fizer (alunos, contratos, etc.) fica salvo no Supabase.

---

## Passo 1: Conta e projeto no Supabase

### 1.1 Criar conta (se ainda não tiver)

1. Acesse: **https://supabase.com**
2. Clique em **Start your project**.
3. Faça login com GitHub ou e-mail e crie a conta.

### 1.2 Criar um novo projeto

1. No painel do Supabase, clique em **New Project**.
2. Escolha uma **Organization** (pode ser a padrão).
3. Preencha:
   - **Name**: por exemplo `contraton` (pode ser qualquer nome).
   - **Database Password**: **crie uma senha e guarde num lugar seguro.** Essa senha é a do **banco de dados**, não a do seu login no Supabase. Você vai usar ela no próximo passo.
   - **Region**: escolha a mais próxima de você (ex.: South America).
4. Clique em **Create new project** e espere alguns minutos até o projeto ficar pronto.

---

## Passo 2: Pegar a URL de conexão (Connection string)

Essa URL é como o “endereço + senha” que o aplicativo usa para falar com o banco.

1. No Supabase, abra o **seu projeto** (clique nele).
2. No menu da esquerda, clique no **ícone de engrenagem** (⚙️) em baixo → **Project Settings**.
3. No menu interno, clique em **Database**.
4. Role a página até a parte **Connection string**.
5. Em **Connection string**, selecione a aba **URI**.
6. **Muito importante:** no seletor ao lado, escolha **Session mode** (porta **5432**). Não use “Transaction mode” (6543).
7. Copie a URI que aparece. Ela será algo assim:
   ```text
   postgresql://postgres.XXXXX:[YOUR-PASSWORD]@aws-0-XX-XXXX-X.pooler.supabase.com:5432/postgres
   ```
8. No lugar de **`[YOUR-PASSWORD]`**, troque pela **senha do banco** que você criou no Passo 1.2 (a mesma que você guardou).
   - Exemplo: se a senha é `MinhaSenha123`, a URL fica:
   ```text
   postgresql://postgres.XXXXX:MinhaSenha123@aws-0-XX-XXXX-X.pooler.supabase.com:5432/postgres
   ```
9. **No final da URL**, adicione: `?sslmode=require`  
   - Exemplo completo:
   ```text
   postgresql://postgres.XXXXX:MinhaSenha123@aws-0-XX-XXXX-X.pooler.supabase.com:5432/postgres?sslmode=require
   ```
10. Copie essa URL inteira (do `postgresql` até `sslmode=require`) e guarde num bloco de notas por enquanto.

**Se sua senha tiver caracteres especiais** (como `@`, `#`, `%`, `?`):  
- Ou use uma senha só com letras e números, **ou**  
- Pesquise na internet “URL encode password” e substitua o caractere (ex.: `@` vira `%40`).

---

## Passo 3: Colocar a URL no arquivo `.env` do projeto

O aplicativo lê a conexão do banco de um arquivo chamado `.env`, que fica **dentro da pasta do aplicativo** (na mesma pasta onde está o `package.json`).

No seu computador, o caminho da pasta é:

```text
c:\Users\bsbth\contratoN\contraton
```

Dentro dessa pasta deve existir um arquivo chamado **`.env`** (pode estar oculto; no Explorer do Windows, ative “Mostrar itens ocultos” se precisar).

### O que fazer:

1. Abra a pasta: `c:\Users\bsbth\contratoN\contraton`
2. Se não existir um arquivo `.env`, crie um novo arquivo de texto e **renomeie** para exatamente: **`.env`** (sem .txt no final).
3. Abra o arquivo `.env` com o Bloco de Notas ou com o Cursor/VS Code.
4. Coloque **uma única linha** (tudo na mesma linha), entre aspas, assim:

   ```env
   DATABASE_URL="postgresql://postgres.XXXXX:SUA_SENHA@aws-0-XX-XXXX-X.pooler.supabase.com:5432/postgres?sslmode=require"
   ```

   Troque **toda a parte** depois do `=` pela **URL completa** que você montou no Passo 2 (a que termina em `?sslmode=require`).

5. Salve o arquivo e feche.

**Resumo:** o arquivo `.env` deve ficar em `contraton\.env` e conter só essa linha (ou outras que já existam), com `DATABASE_URL="..."` e a URL completa dentro das aspas.

---

## Passo 4: Rodar os comandos para criar tabelas e dados iniciais

Agora falta dizer ao aplicativo para **criar as tabelas no banco** e **inserir os primeiros dados** (planos e usuário admin).

1. Abra o **terminal** (PowerShell ou CMD) ou o terminal integrado do Cursor (Terminal → New Terminal).
2. Vá para a pasta do projeto:
   ```powershell
   cd c:\Users\bsbth\contratoN\contraton
   ```
3. Rode estes dois comandos **um por vez**, na ordem:

   **Comando 1 – criar as tabelas no banco:**
   ```powershell
   npx prisma migrate deploy
   ```
   Espere terminar. Deve aparecer algo como “Applied migration...”.

   **Comando 2 – carregar planos e usuário admin:**
   ```powershell
   npm run db:seed
   ```
   Deve aparecer algo como: “Seed: admin@contraton.com / admin123 e planos criados.”

4. Se os dois comandos rodarem sem erro, **está configurado.** O aplicativo já está usando o banco.

**Login no app:**  
- E-mail: **admin@contraton.com**  
- Senha: **admin123**  
(Altere a senha depois pelo Supabase ou por uma funcionalidade de “trocar senha” se o app tiver.)

---

## Conferindo se deu certo

1. Inicie o aplicativo (se não estiver rodando):
   ```powershell
   cd c:\Users\bsbth\contratoN\contraton
   npm run dev
   ```
2. No navegador, abra: **http://localhost:3000**
3. Faça login com **admin@contraton.com** / **admin123**.
4. Vá em **Planos**: devem aparecer os planos (mensal, trimestral, semestral, anual, consultoria online). Esses vêm do banco agora.
5. Crie um aluno e um contrato: eles devem ser salvos e continuar lá depois de recarregar a página.

Se isso acontecer, o aplicativo está rodando **perfeitamente com o banco de dados**.

---

## Erros comuns e o que fazer

| O que aparece | O que fazer |
|---------------|-------------|
| **"Environment variable not found: DATABASE_URL"** | O arquivo `.env` não está na pasta `contraton` ou o nome está errado. O nome deve ser exatamente `DATABASE_URL` e a linha não pode estar quebrada no meio. |
| **"the URL must start with the protocol postgresql://"** | A `DATABASE_URL` está vazia ou sem `postgresql://` no início. Cole a URL completa entre aspas no `.env`. |
| **Erro de conexão / timeout / SSL** | Confirme que usou **Session mode (5432)** e que colocou `?sslmode=require` no final da URL. Confira a senha (sem espaços no início/fim). |
| **"Plano não encontrado" ou lista vazia** | Rode de novo o segundo comando: `npm run db:seed`. Ele é quem insere os planos. |

---

## Resumo final

| O que | Onde / Como |
|-------|--------------|
| Conta e projeto | Supabase (supabase.com) → New Project, anotar a senha do banco. |
| URL de conexão | Project Settings → Database → Connection string → URI → **Session (5432)** → trocar `[YOUR-PASSWORD]` pela senha → adicionar `?sslmode=require` no final. |
| Onde colar a URL | Arquivo **`.env`** na pasta **`c:\Users\bsbth\contratoN\contraton`**, em uma linha: `DATABASE_URL="URL_COM_PLETA_AQUI"`. |
| Comandos depois | Na pasta `contraton`: `npx prisma migrate deploy` e depois `npm run db:seed`. |
| Login no app | admin@contraton.com / admin123 (troque depois se quiser). |

Depois disso, não há mais nada **obrigatório** para configurar na mão para o app rodar com o banco. O restante (criar alunos, planos, contratos) você faz pelo próprio aplicativo.
