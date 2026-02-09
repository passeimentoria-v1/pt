# 🚀 NOVAS FUNCIONALIDADES - Português Game

## ✨ 3 Novos Recursos Implementados

---

## 1️⃣ UPLOAD DE QUESTÕES VIA EXCEL 📊

### O que é?
Envie dezenas ou centenas de questões de uma só vez através de uma planilha Excel, economizando MUITO tempo!

### Como usar (Professor):

1. **Acesse o Dashboard do Professor**
2. **Clique em "Upload Excel"** (card verde)
3. **Baixe o template** clicando em "Baixar Template Excel"
4. **Preencha o template** com suas questões:

#### Formato da Planilha:
```
| categoria    | enunciado              | alternativa_a | alternativa_b | alternativa_c | alternativa_d | resposta_correta | xp  | explicacao          |
|--------------|------------------------|---------------|---------------|---------------|---------------|------------------|-----|---------------------|
| ortografia   | Qual a forma correta?  | Excessão     | Exceção       | Escessão      | Escesão       | B                | 50  | A forma correta é...|
| gramatica    | Complete a frase...    | foi          | fui           | foram         | for           | A                | 75  | Porque...          |
```

#### Regras:
- **categoria**: ortografia, gramatica, interpretacao ou redacao (tudo minúsculo, sem acentos)
- **resposta_correta**: A, B, C ou D (maiúsculo)
- **xp**: Número entre 10 e 200 (geralmente 50, 75 ou 100)
- **explicacao**: Opcional, mas recomendado para melhor aprendizado

5. **Selecione o arquivo** preenchido
6. **Revise o preview** das questões importadas
7. **Clique em "Enviar X Questões"**

### Benefícios:
✅ Cadastre 50+ questões em menos de 5 minutos  
✅ Copie e cole de outros materiais  
✅ Trabalhe offline na planilha  
✅ Compartilhe planilhas com outros professores  

---

## 2️⃣ DESAFIO DIÁRIO 🔥

### O que é?
Uma questão especial por dia que dá **XP EM DOBRO**! Mantém os alunos engajados voltando todos os dias.

### Como funciona:

#### Para o Aluno:
1. **Acesse o Dashboard**
2. **Clique no banner laranja** "Desafio Diário"
3. **Responda UMA questão** especial do dia
4. **Ganhe XP em DOBRO!** (se a questão vale 50 XP, você ganha 100 XP)
5. **Volte amanhã** para um novo desafio

### Características:
- 📅 **1 questão por dia**: Nova questão todo dia à meia-noite
- ⚡ **XP em Dobro**: Recompensa 2x maior
- 🔄 **Mesma questão para todos**: Todos os alunos respondem a mesma questão do dia
- ✅ **Uma tentativa**: Só pode fazer uma vez por dia
- 🔥 **Mantém streak**: Completa automaticamente a sequência do dia

### Estratégia de Engajamento:
O desafio diário incentiva os alunos a:
- Voltarem à plataforma todos os dias
- Manterem a sequência (streak)
- Competirem por mais XP
- Criarem um hábito de estudo

---

## 3️⃣ SISTEMA DE TURMAS 🎓

### O que é?
Organize seus alunos em turmas (ex: "3º Ano A", "Turma Avançada", "Sábado Manhã") com códigos de acesso únicos.

### Como usar (Professor):

#### Criar uma Turma:
1. **Dashboard do Professor** → Clique em "Gerenciar Turmas"
2. **Clique em "+ Nova Turma"**
3. **Preencha os dados**:
   - Nome da turma (ex: "3º Ano A")
   - Descrição (ex: "Preparação ENEM 2026")
   - Escolha um emoji (📚 🎓 ✏️ etc)
4. **Código de acesso gerado automaticamente** (ex: ABC123)
5. **Clique em "Criar Turma"**

#### Compartilhar com os Alunos:
1. **Copie o código** clicando no ícone de copiar
2. **Compartilhe com os alunos** (WhatsApp, presencial, etc)
3. **Alunos usam o código** para entrar na turma

### Como usar (Aluno):

#### Entrar em uma Turma:
1. **Dashboard do Aluno** → Seção "Minhas Turmas"
2. **Clique em "+ Entrar em Turma"**
3. **Digite o código** fornecido pelo professor (ex: ABC123)
4. **Pronto!** Você está na turma

### Benefícios do Sistema de Turmas:

#### Para o Professor:
✅ **Organização**: Separe alunos por período, nível, objetivo  
✅ **Estatísticas por turma**: Veja XP médio, melhor aluno, etc  
✅ **Ranking interno**: Compare turmas diferentes  
✅ **Controle de acesso**: Código único por turma  

#### Para o Aluno:
✅ **Identidade**: Pertencimento a uma turma  
✅ **Competição saudável**: Ranking da turma  
✅ **Motivação**: Competir com colegas conhecidos  

### Recursos do Card de Turma:
- 📊 **Número de alunos** cadastrados
- 🏆 **XP médio** da turma
- 📋 **Lista de alunos** ordenados por XP
- 📝 **Código de acesso** sempre visível
- 📤 **Copiar código** com um clique

---

## 🔧 CONFIGURAÇÃO DO FIREBASE

Para essas funcionalidades funcionarem, você precisa atualizar as **Regras de Segurança do Firestore**:

1. Acesse o **Firebase Console**
2. Vá em **Firestore Database** → **Regras**
3. **Substitua TUDO** por:

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
    
    // ===== NOVAS REGRAS =====
    
    // Regras de turmas
    match /turmas/{turmaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
      allow update: if request.auth != null;
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'teacher';
    }
    
    // Regras de desafios diários (questões do dia)
    match /dailyChallengeQuestions/{date} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Regras de progresso do desafio diário
    match /dailyChallenges/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. **Clique em "Publicar"**

---

## 📊 ESTRUTURA DOS DADOS

### Coleção `turmas`
```javascript
{
  name: "3º Ano A",
  description: "Preparação ENEM 2026",
  emoji: "📚",
  accessCode: "ABC123",
  teacherId: "professor_uid",
  students: ["aluno1_uid", "aluno2_uid", ...],
  createdAt: "2024-01-01T10:00:00.000Z"
}
```

### Coleção `dailyChallengeQuestions`
```javascript
// Documento ID = data no formato "YYYY-MM-DD"
{
  category: "ortografia",
  question: "Qual a forma correta?",
  alternatives: ["opção 1", "opção 2", "opção 3", "opção 4"],
  correctAnswer: 1,
  xpReward: 50,
  explanation: "Explicação..."
}
```

### Coleção `dailyChallenges`
```javascript
// Documento ID = userId
{
  lastCompleted: "2024-01-15",
  totalCompleted: 45,
  xpEarned: 100
}
```

---

## 🎯 FLUXO DE USO COMPLETO

### Semana 1 - Setup:
1. **Professor** cria turma "3º Ano A"
2. **Professor** faz upload de 50 questões via Excel
3. **Professor** compartilha código ABC123 com alunos
4. **Alunos** entram na turma usando o código

### Semana 2 - Engajamento:
1. **Segunda**: Aluno entra, faz desafio diário (+100 XP)
2. **Terça**: Aluno volta, faz novo desafio (+100 XP), mantém streak
3. **Quarta**: Aluno pratica trilhas normais (+50 XP por questão)
4. **Quinta**: Desafio diário novamente (+100 XP)
5. **Sexta**: Aluno vê que está em 3º no ranking da turma, estuda mais
6. **Sábado/Domingo**: Mantém streak com desafio diário

### Resultado:
- ✅ Aluno engajado todos os dias
- ✅ Competição saudável na turma
- ✅ Professor com controle total
- ✅ Muito menos trabalho manual

---

## 💡 DICAS DE USO

### Para Professores:

**Upload Excel:**
- Prepare um banco de 200+ questões
- Categorize bem (ortografia, gramática, etc)
- Varie a dificuldade (50 XP = fácil, 100 XP = difícil)
- Adicione explicações detalhadas

**Turmas:**
- Crie turmas específicas (por dia da semana, nível, objetivo)
- Use emojis diferentes para cada turma
- Acompanhe o XP médio semanalmente
- Parabenize publicamente o top 3 da turma

**Desafio Diário:**
- Mencione o desafio em sala de aula
- Crie competições: "quem fizer 7 dias seguidos ganha..."
- Use como lição de casa gamificada

### Para Alunos:

**Maximize seu XP:**
- Faça SEMPRE o desafio diário (XP em dobro!)
- Mantenha o streak (não deixe quebrar a sequência)
- Entre em uma turma para competir
- Pratique as trilhas para subir de nível

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### "Código de turma inválido"
- Verifique se digitou corretamente (6 caracteres)
- Código é case-insensitive (ABC123 = abc123)
- Peça ao professor para confirmar o código

### "Você já completou o desafio de hoje"
- Só pode fazer 1 vez por dia
- Volte à meia-noite para o próximo desafio
- Pratique as trilhas normais enquanto isso

### "Erro ao fazer upload do Excel"
- Verifique o formato das colunas (exatamente como no template)
- resposta_correta deve ser A, B, C ou D
- categoria deve ser: ortografia, gramatica, interpretacao ou redacao
- Não pode ter linhas em branco

---

## 🎉 PRÓXIMOS PASSOS

Agora que você tem essas 3 funcionalidades:

1. ✅ **Crie suas turmas**
2. ✅ **Faça upload de questões em massa**
3. ✅ **Convide seus alunos**
4. ✅ **Acompanhe o engajamento diário**

**A plataforma está completa e pronta para transformar suas aulas! 🚀**
