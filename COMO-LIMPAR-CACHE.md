# 🔄 Como Limpar o Cache no Celular

Se as atualizações não aparecerem no celular, siga estes passos:

## 📱 Android (Chrome)

### Método 1: Limpar Cache do Site
1. Abra o Chrome no celular
2. Acesse o site: `https://contrato-six.vercel.app`
3. Toque nos **três pontos** (menu) no canto superior direito
4. Vá em **Configurações** → **Privacidade e segurança** → **Limpar dados de navegação**
5. Marque apenas **Cache de imagens e arquivos**
6. Selecione o período: **Última hora**
7. Toque em **Limpar dados**

### Método 2: Desinstalar e Reinstalar o PWA
1. Vá em **Configurações** → **Apps**
2. Encontre o app **Contraton** (ou o nome do seu PWA)
3. Toque em **Desinstalar**
4. Acesse o site novamente no Chrome
5. Instale novamente quando aparecer o prompt

### Método 3: Forçar Atualização
1. Abra o site no Chrome
2. Toque e segure o botão de **Atualizar** (ou pressione F5)
3. Ou feche completamente o Chrome e abra novamente

## 🍎 iPhone/iPad (Safari)

### Método 1: Limpar Cache do Safari
1. Abra **Configurações** no iPhone
2. Vá em **Safari**
3. Role até **Limpar histórico e dados do site**
4. Toque em **Limpar histórico e dados**
5. Confirme

### Método 2: Modo Privado
1. Abra o Safari
2. Toque no ícone de **abas** (dois quadrados)
3. Toque em **Privado**
4. Acesse o site em modo privado (não usa cache)

### Método 3: Forçar Atualização
1. Abra o site no Safari
2. Toque e segure o botão de **Atualizar**
3. Selecione **Recarregar sem cache**

## 💻 Desktop (Chrome/Edge)

1. Pressione **Ctrl + Shift + R** (Windows) ou **Cmd + Shift + R** (Mac)
2. Ou abra as **Ferramentas do Desenvolvedor** (F12)
3. Clique com botão direito no botão de atualizar
4. Selecione **Esvaziar cache e atualizar forçadamente**

## 🔧 Desabilitar Service Worker Temporariamente

Se nada funcionar, você pode desabilitar o service worker:

1. Abra as **Ferramentas do Desenvolvedor** (F12)
2. Vá na aba **Application** (ou **Aplicativo**)
3. No menu lateral, clique em **Service Workers**
4. Clique em **Unregister** ao lado do service worker
5. Recarregue a página

## ✅ Verificar se Funcionou

Após limpar o cache:
1. Feche completamente o navegador
2. Abra novamente
3. Acesse o site
4. Teste a funcionalidade de assinatura com o dedo
5. Verifique se o botão de rotação aparece

## 🆘 Se Ainda Não Funcionar

1. Verifique se está acessando a URL correta: `https://contrato-six.vercel.app`
2. Verifique se o deploy na Vercel foi concluído com sucesso
3. Tente em outro navegador ou dispositivo
4. Aguarde alguns minutos (pode levar até 5 minutos para propagar)
