# 🔧 Configuração GitHub OAuth + Firebase

## 📋 Pré-requisitos

1. Conta no [Firebase Console](https://console.firebase.google.com/)
2. Conta no [GitHub](https://github.com/)
3. Projeto Firebase criado

## 🚀 Passo a Passo

### 1️⃣ **Configurar GitHub OAuth App**

1. Acesse: [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em **"New OAuth App"**
3. Preencha os dados:
   ```
   Application name: Elite Tracker
   Homepage URL: http://localhost:5173 (para desenvolvimento)
   Authorization callback URL: https://SEU_PROJECT_ID.firebaseapp.com/__/auth/handler
   ```
4. **Importante**: Substitua `SEU_PROJECT_ID` pelo ID do seu projeto Firebase
5. Anote o **Client ID** e **Client Secret**

### 2️⃣ **Configurar Firebase Authentication**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Sign-in method**
4. Encontre **GitHub** e clique em **"Enable"**
5. Cole o **Client ID** e **Client Secret** do GitHub
6. Copie a **URL de redirecionamento** (você vai precisar no passo 1)

### 3️⃣ **Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4️⃣ **Encontrar suas Configurações Firebase**

1. No Firebase Console, vá em **Project Settings** (ícone da engrenagem)
2. Role para baixo até **"Your apps"**
3. Clique em **"Config"** do seu app web
4. Copie os valores para o arquivo `.env`

### 5️⃣ **Configurar Domínios Autorizados** (Para produção)

1. No Firebase Console: **Authentication** → **Settings** → **Authorized domains**
2. Adicione seus domínios de produção

## ✅ **Testar a Configuração**

1. Execute o projeto: `npm run dev`
2. Acesse: `http://localhost:5173`
3. Clique em **"GitHub"** na tela de login
4. Autorize o app no GitHub
5. Você deve ser redirecionado para a página de hábitos

## 🐛 **Problemas Comuns**

### "Pop-up bloqueado"
- Permitir pop-ups para `localhost:5173`
- Ou usar: `signInWithRedirect()` em vez de `signInWithPopup()`

### "Invalid redirect URI"
- Verificar se a URL no GitHub OAuth App está correta
- Verificar se o Project ID está correto

### "Configuration not found"
- Verificar se o arquivo `.env` está na raiz
- Verificar se as variáveis começam com `VITE_`
- Reiniciar o servidor de desenvolvimento

## 📱 **Para Produção**

1. Atualizar **Homepage URL** e **Authorization callback URL** no GitHub
2. Adicionar domínio de produção nos **Authorized domains** do Firebase
3. Configurar variáveis de ambiente no seu host (Vercel, Netlify, etc.)

---

🎉 **Pronto! Seu login com GitHub está configurado!** 