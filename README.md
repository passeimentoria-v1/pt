# 🎮 Português Game - Plataforma Gamificada de Português

Plataforma web gamificada para ensino de português brasileiro, desenvolvida para professores e alunos de escolas e cursinhos.

## ✨ Funcionalidades

### Para Alunos
- 🎯 Sistema de XP e níveis
- 🏆 Conquistas e badges
- 🔥 Sistema de sequência (streaks)
- 📊 Ranking competitivo
- 📚 Trilhas de aprendizado (Ortografia, Gramática, Interpretação, Redação)
- ✅ Exercícios interativos com feedback imediato

### Para Professores
- ➕ Adicionar questões personalizadas
- 📈 Dashboard com estatísticas dos alunos
- 👥 Gerenciamento de turmas
- 🏅 Configuração de conquistas
- 📊 Acompanhamento de progresso individual

## 🚀 Tecnologias

- **React** - Interface do usuário
- **Firebase** - Backend (Auth + Firestore)
- **Tailwind CSS** - Estilização
- **Vite** - Build tool
- **Lucide React** - Ícones

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd portugues-gamificado
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative **Authentication** (Email/Password)
3. Crie um banco **Firestore Database**
4. Copie as credenciais do Firebase
5. Edite o arquivo `src/firebase.js` e cole suas credenciais:

```javascript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "seu-messaging-id",
  appId: "seu-app-id"
};
```

### 4. Configure as regras do Firestore

No Firebase Console, vá em Firestore Database > Rules e adicione:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras de usuários
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Regras de questões
    match /questions/{questionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Regras de progresso
    match /progress/{progressId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    // Regras de badges
    match /badges/{badgeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
  }
}
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse: http://localhost:5173

## 🎨 Estrutura do Projeto

```
portugues-gamificado/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   ├── contexts/          # Context API (Auth)
│   ├── pages/             # Páginas da aplicação
│   │   ├── Login.jsx
│   │   ├── DashboardAluno.jsx
│   │   ├── DashboardProfessor.jsx
│   │   └── Exercicios.jsx
│   ├── firebase.js        # Configuração Firebase
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 📊 Estrutura do Firestore

### Coleção `users`
```javascript
{
  name: "João Silva",
  email: "joao@email.com",
  role: "student", // ou "teacher"
  xp: 250,
  level: 3,
  streak: 7,
  lastStudyDate: "2024-01-15",
  badges: ["badge_id_1", "badge_id_2"],
  createdAt: "2024-01-01T10:00:00.000Z"
}
```

### Coleção `questions`
```javascript
{
  category: "ortografia", // ortografia, gramatica, interpretacao, redacao
  question: "Qual a forma correta?",
  alternatives: ["opção 1", "opção 2", "opção 3", "opção 4"],
  correctAnswer: 0, // índice da resposta correta
  xpReward: 50,
  explanation: "Explicação da resposta...",
  createdAt: "2024-01-01T10:00:00.000Z"
}
```

### Coleção `badges`
```javascript
{
  name: "Mestre da Crase",
  description: "Acerte 50 questões de ortografia",
  icon: "🏆",
  requirement: {
    type: "questions_correct",
    category: "ortografia",
    count: 50
  }
}
```

## 🎯 Como Usar

### Como Professor

1. Registre-se como **Professor**
2. No dashboard, clique em **"Adicionar Questão"**
3. Preencha os dados da questão:
   - Categoria (Ortografia, Gramática, etc)
   - Enunciado
   - 4 alternativas
   - Marque a resposta correta
   - Defina XP de recompensa
   - Adicione explicação (opcional)
4. Acompanhe o progresso dos alunos na tabela

### Como Aluno

1. Registre-se como **Aluno**
2. No dashboard, escolha uma **trilha de aprendizado**
3. Responda as questões
4. Ganhe XP e suba de nível
5. Desbloqueie conquistas
6. Compete no ranking com outros alunos

## 🚀 Deploy

### Opção 1: Firebase Hosting
```bash
npm run build
firebase deploy
```

### Opção 2: Vercel
```bash
npm run build
vercel deploy
```

### Opção 3: Netlify
```bash
npm run build
netlify deploy --prod
```

## 🎮 Sistema de Gamificação

- **XP**: Cada questão correta dá XP (configurável por questão)
- **Níveis**: A cada 100 XP o aluno sobe de nível
- **Sequência (Streak)**: Dias consecutivos estudando
- **Badges**: Conquistas desbloqueáveis por metas
- **Ranking**: Classificação por XP total

## 📝 Próximas Melhorias

- [ ] Sistema de turmas
- [ ] Desafios entre alunos
- [ ] Missões diárias/semanais
- [ ] Gráficos de evolução
- [ ] Upload de questões via Excel
- [ ] Sistema de notificações
- [ ] Modo offline (PWA)
- [ ] Aplicativo mobile (React Native)

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

## 👨‍💻 Desenvolvido por

**Seu Nome** - Professor de Português  
📧 seu-email@exemplo.com

---

**Transformando o ensino de português através da gamificação! 🚀📚**
