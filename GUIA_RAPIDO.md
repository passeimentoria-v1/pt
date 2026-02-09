# 🚀 GUIA RÁPIDO - Português Game

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Instale Node.js
Se você ainda não tem, baixe em: https://nodejs.org
(Baixe a versão LTS - recomendada)

### 2️⃣ Abra o Terminal/Prompt
- **Windows**: Aperte `Win + R`, digite `cmd` e dê Enter
- **Mac**: Aperte `Cmd + Espaço`, digite `terminal` e dê Enter
- **Linux**: Aperte `Ctrl + Alt + T`

### 3️⃣ Navegue até a pasta do projeto
```bash
cd caminho/para/portugues-gamificado
```

### 4️⃣ Instale as dependências
```bash
npm install
```
⏱️ Isso vai demorar 1-2 minutos na primeira vez

### 5️⃣ Configure o Firebase

#### A) Crie um projeto Firebase (GRATUITO!)
1. Acesse: https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Digite um nome (ex: "portugues-game")
4. Desative Google Analytics (não precisa)
5. Clique em "Criar projeto"

#### B) Configure Autenticação
1. No menu lateral, clique em "Authentication"
2. Clique em "Vamos começar"
3. Clique em "Email/senha"
4. Ative a primeira opção
5. Clique em "Salvar"

#### C) Configure Firestore
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste"
4. Escolha a localização "southamerica-east1 (São Paulo)"
5. Clique em "Ativar"

#### D) Configure as Regras de Segurança
1. Ainda no Firestore, clique em "Regras"
2. Substitua TODO o conteúdo por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    match /progress/{progressId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    match /badges/{badgeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

3. Clique em "Publicar"

#### E) Copie as credenciais
1. No menu lateral, clique no ⚙️ (ícone de engrenagem)
2. Clique em "Configurações do projeto"
3. Role até "Seus aplicativos"
4. Clique no ícone `</>`  (web)
5. Digite um apelido (ex: "portugues-game-web")
6. Clique em "Registrar app"
7. **COPIE** o código do `firebaseConfig`

#### F) Cole no projeto
1. Abra o arquivo `src/firebase.js`
2. Substitua os valores de `firebaseConfig` pelos seus
3. Salve o arquivo (Ctrl+S ou Cmd+S)

### 6️⃣ Inicie o servidor
```bash
npm run dev
```

### 7️⃣ Abra no navegador
Acesse: http://localhost:5173

🎉 **PRONTO!** Sua plataforma está rodando!

---

## 🎯 Primeiros Passos

### Como Professor (PRIMEIRO ACESSO):

1. Na tela inicial, clique em **"Registrar"**
2. Preencha:
   - Nome: Seu nome
   - Você é: **Professor**
   - Email: seu@email.com
   - Senha: suasenha123
3. Clique em "Criar Conta"
4. Você será redirecionado para o painel do professor
5. Clique em **"Adicionar Questão"**
6. Cadastre suas primeiras questões!

💡 **Dica**: Use o arquivo `QUESTOES_EXEMPLO.md` para copiar questões prontas!

### Como Aluno (TESTE):

1. Abra uma janela anônima/privada do navegador
2. Acesse: http://localhost:5173
3. Clique em **"Registrar"**
4. Preencha:
   - Nome: Nome do Aluno
   - Você é: **Aluno**
   - Email: aluno@teste.com
   - Senha: 123456
5. Clique em "Criar Conta"
6. Explore as trilhas e responda questões!

---

## 🆘 Problemas Comuns

### "npm não é reconhecido"
❌ **Problema**: Node.js não está instalado ou não está no PATH  
✅ **Solução**: Baixe e instale o Node.js: https://nodejs.org

### "Firebase: Error (auth/invalid-api-key)"
❌ **Problema**: Credenciais do Firebase incorretas  
✅ **Solução**: Verifique se copiou TODAS as credenciais corretamente no `src/firebase.js`

### "Permission denied"
❌ **Problema**: Regras de segurança do Firestore não configuradas  
✅ **Solução**: Siga novamente o passo 5-D acima

### Porta 5173 já está em uso
❌ **Problema**: Outro projeto rodando na mesma porta  
✅ **Solução**: Pare o outro projeto ou edite `vite.config.js` para mudar a porta

### Página em branco
❌ **Problema**: Erro de JavaScript no console  
✅ **Solução**: 
1. Aperte F12 para abrir o Console
2. Leia o erro
3. Geralmente é problema nas credenciais do Firebase

---

## 📱 Transformar em PWA (App Instalável)

Depois que tudo estiver funcionando, você pode transformar em um aplicativo instalável:

1. Instale o plugin PWA:
```bash
npm install vite-plugin-pwa -D
```

2. Edite `vite.config.js` e adicione o plugin PWA

3. Execute o build:
```bash
npm run build
```

4. Faça deploy (Vercel, Netlify ou Firebase Hosting)

---

## 🌐 Colocar Online (Deploy)

### Opção 1: Vercel (MAIS FÁCIL - GRATUITO)

1. Crie conta em: https://vercel.com
2. Instale o Vercel CLI:
```bash
npm install -g vercel
```
3. Execute:
```bash
npm run build
vercel
```
4. Siga as instruções na tela
5. Pronto! Você terá um link público

### Opção 2: Netlify (GRATUITO)

1. Crie conta em: https://netlify.com
2. Arraste a pasta `dist` (depois do build) para o Netlify
3. Pronto!

### Opção 3: Firebase Hosting (GRATUITO)

1. Instale o Firebase CLI:
```bash
npm install -g firebase-tools
```
2. Execute:
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

---

## 📞 Precisa de Ajuda?

Se você está tendo problemas:

1. ✅ Verifique se seguiu TODOS os passos
2. ✅ Leia os erros no console do navegador (F12)
3. ✅ Confira as credenciais do Firebase
4. ✅ Teste em outro navegador

---

## 🎓 Recursos de Aprendizado

- **React**: https://react.dev/learn
- **Firebase**: https://firebase.google.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev

---

Desenvolvido com ❤️ para transformar o ensino de português!
