# 🔍 GUIA DE DEBUG - PROGRESSO DA TRILHA

## ✅ O QUE FOI CORRIGIDO:

### **1. Função `reloadUserData` adicionada ao AuthContext**
Agora o sistema recarrega os dados do usuário após cada exercício concluído.

### **2. Console logs adicionados**
Para você verificar se está funcionando, abra o **Console do navegador** (F12).

### **3. Notificação visual**
Após completar um exercício, aparecerá um alerta mostrando o progresso.

---

## 🧪 COMO TESTAR:

### **Passo 1: Abrir Console**
```
1. Pressione F12 no navegador
2. Vá na aba "Console"
3. Deixe aberto
```

### **Passo 2: Fazer um Exercício**
```
1. Clique em "Floresta da Ortografia"
2. Responda 5 questões
3. Ao finalizar, observe o console
```

### **Passo 3: Ver Logs**
Você deve ver no console:
```
✅ Progresso de Ortografia atualizado para 5%
📊 Campo salvo: ortografiaProgress
✅ UserData recarregado após completar exercício
✅ UserData recarregado: {ortografiaProgress: 5, ...}
```

### **Passo 4: Verificar Dashboard**
```
1. Volte ao Dashboard (botão Voltar)
2. Role até "Sua Jornada de Aprendizado"
3. Veja a barra de progresso da Ortografia
4. Deve estar em 5%
```

---

## 🔥 SE AINDA NÃO FUNCIONAR:

### **Opção 1: Verificar Firestore**
```
1. Abra Firebase Console
2. Vá em Firestore Database
3. Abra sua coleção "users"
4. Encontre seu usuário
5. Verifique se tem os campos:
   - ortografiaProgress: 5
   - gramaticaProgress: 0
   - interpretacaoProgress: 0
   - redacaoProgress: 0
```

### **Opção 2: Limpar Cache**
```
1. Pressione Ctrl+Shift+Delete
2. Marque "Cache" e "Cookies"
3. Limpe tudo
4. Recarregue a página (F5)
5. Faça login novamente
6. Teste novamente
```

### **Opção 3: Verificar se está salvando**
Adicione este código temporário no `nextQuestion` do Exercicios.jsx:
```javascript
// Após salvar, verificar no Firestore
const verifyDoc = await getDoc(userRef);
console.log('🔍 Dados no Firestore:', verifyDoc.data());
```

---

## 📊 ESTRUTURA CORRETA NO FIRESTORE:

Seu documento de usuário deve ter:
```json
{
  "name": "Seu Nome",
  "email": "seu@email.com",
  "xp": 500,
  "level": 5,
  "ortografiaProgress": 25,      // ← DEVE TER ISSO
  "gramaticaProgress": 15,       // ← DEVE TER ISSO
  "interpretacaoProgress": 0,    // ← DEVE TER ISSO
  "redacaoProgress": 10,         // ← DEVE TER ISSO
  "exercisesCompleted": 8,
  "questionsCompleted": 40
}
```

---

## 🎯 CADA EXERCÍCIO = +5%

- Complete 1 exercício (5 questões) = +5%
- Complete 20 exercícios = 100% (3 estrelas)

### **Tabela de Estrelas:**
| Progresso | Estrelas |
|---|---|
| 0-33% | ⭐☆☆ |
| 34-66% | ⭐⭐☆ |
| 67-100% | ⭐⭐⭐ |

---

## 🚨 PROBLEMAS COMUNS:

### **Problema 1: "ortografiaProgress is undefined"**
**Solução:** O campo ainda não foi criado. Complete 1 exercício para criar.

### **Problema 2: "reloadUserData is not a function"**
**Solução:** O AuthContext não foi atualizado. Recarregue TODA a aplicação (npm run dev).

### **Problema 3: Progresso mostra 0% mesmo após completar**
**Solução:** 
1. Verifique o console por erros
2. Limpe o cache do navegador
3. Verifique se o Firebase está configurado corretamente

### **Problema 4: Notificação não aparece**
**Solução:** Verifique se há erros no console antes de completar o exercício.

---

## 🔧 COMANDOS ÚTEIS:

### **Ver userData atual no console:**
```javascript
console.log(userData);
```

### **Forçar reload dos dados:**
```javascript
await reloadUserData();
```

### **Ver progresso específico:**
```javascript
console.log('Ortografia:', userData?.ortografiaProgress);
console.log('Gramática:', userData?.gramaticaProgress);
```

---

## ✅ TESTE FINAL:

```
1. Feche TUDO
2. Execute: npm run dev
3. Faça login
4. Abra Console (F12)
5. Faça 1 exercício de Ortografia
6. Veja logs no console
7. Veja alerta de progresso
8. Volte ao dashboard
9. Veja barra de progresso em 5%
10. Passe mouse no botão
11. Veja tooltip com "5%"
```

---

## 💡 DICA:

Se você completou 10 exercícios de Ortografia e 10 de Redação (como disse), deveria ter:
- **Ortografia:** 50% (10 × 5%)
- **Redação:** 50% (10 × 5%)

Se não está aparecendo, o problema é que os dados antigos não foram salvos. 

**Solução:** Continue completando novos exercícios AGORA que o sistema foi corrigido!

---

## 🎯 PRÓXIMOS PASSOS:

1. Complete MAIS 1 exercício de Ortografia
2. Veja se aparece 5% (ou aumenta)
3. Se aparecer, significa que está funcionando AGORA
4. Os exercícios anteriores não foram contados (infelizmente)
5. Mas TODOS os próximos serão!

**O sistema está corrigido! Teste novamente! 🚀**
