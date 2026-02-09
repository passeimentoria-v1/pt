# 🔄 GUIA DE ATUALIZAÇÃO - Português Game

## Se você já tem a versão anterior funcionando:

### Opção 1: Substituir Completamente (Recomendado se está testando)
1. Baixe o novo ZIP
2. Extraia em uma nova pasta
3. Copie o arquivo `src/firebase.js` da versão antiga para a nova
4. Execute `npm install` (instala a nova dependência xlsx)
5. Execute `npm run dev`
6. Pronto!

### Opção 2: Atualizar Apenas os Arquivos Modificados

Se você já tem alunos usando e não quer refazer tudo:

#### 1. Instalar nova dependência
```bash
npm install xlsx
```

#### 2. Adicionar novos arquivos:

**Componentes:**
- `src/components/UploadExcel.jsx`
- `src/components/EntrarTurma.jsx`

**Páginas:**
- `src/pages/DesafioDiario.jsx`
- `src/pages/GerenciarTurmas.jsx`

**Documentação:**
- `NOVAS_FUNCIONALIDADES.md`

#### 3. Atualizar arquivos existentes:

**`src/App.jsx`:**
- Adicionar imports: `DesafioDiario` e `GerenciarTurmas`
- Adicionar rotas:
```jsx
<Route path="/desafio-diario" element={<DesafioDiario />} />
<Route path="/professor/turmas" element={<GerenciarTurmas />} />
```

**`src/pages/DashboardProfessor.jsx`:**
- Adicionar imports: `Upload`, `School` e `UploadExcel`
- Adicionar estado: `const [showUploadExcel, setShowUploadExcel] = useState(false);`
- Substituir seção "Ações Rápidas" com 3 cards (Adicionar, Upload, Turmas)
- Adicionar modal no final: `{showUploadExcel && <UploadExcel ... />}`

**`src/pages/DashboardAluno.jsx`:**
- Adicionar imports: `Calendar`, `Users` e `EntrarTurma`
- Adicionar estados:
```jsx
const [showEntrarTurma, setShowEntrarTurma] = useState(false);
const [userTurmas, setUserTurmas] = useState([]);
```
- Adicionar função `loadUserTurmas`
- Adicionar banner de Desafio Diário
- Adicionar seção "Minhas Turmas"
- Adicionar modal no final: `{showEntrarTurma && <EntrarTurma ... />}`

#### 4. Atualizar Regras do Firestore

**IMPORTANTE**: Copie as novas regras do arquivo `NOVAS_FUNCIONALIDADES.md` e atualize no Firebase Console.

### Opção 3: Copiar e Colar os Arquivos Individualmente

Abra cada arquivo novo no ZIP e copie o conteúdo para seu projeto.

---

## ⚠️ IMPORTANTE: Atualizar Firebase

**Independente da opção escolhida, você PRECISA atualizar as regras do Firestore!**

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Vá em **Firestore Database** → **Regras**
3. Copie as regras do arquivo `NOVAS_FUNCIONALIDADES.md`
4. Cole substituindo as regras antigas
5. Clique em **Publicar**

Sem isso, as novas funcionalidades não funcionarão!

---

## 🧪 Testar as Novas Funcionalidades

### 1. Upload Excel:
- Login como professor
- Clique em "Upload Excel"
- Baixe o template
- Adicione 2-3 questões de teste
- Faça o upload
- Verifique se apareceram

### 2. Desafio Diário:
- Login como aluno
- Clique no banner laranja "Desafio Diário"
- Responda a questão
- Veja se ganhou XP em dobro
- Tente fazer de novo (deve dizer que já completou)

### 3. Turmas:
- Login como professor
- Vá em "Gerenciar Turmas"
- Crie uma turma de teste
- Copie o código
- Login como aluno (em aba anônima)
- Clique em "+ Entrar em Turma"
- Use o código copiado
- Verifique se entrou na turma

---

## 🆘 Problemas Comuns

### "xlsx is not defined"
→ Execute `npm install xlsx` novamente e reinicie o servidor

### "Cannot find module './components/UploadExcel'"
→ Certifique-se de criar todos os novos arquivos nas pastas corretas

### "Permission denied" ao usar as novas funcionalidades
→ Atualize as regras do Firestore (passo crítico!)

### Componentes não aparecem
→ Verifique se os imports estão corretos
→ Reinicie o servidor com `npm run dev`

---

## 📞 Suporte

Se tiver problemas:
1. Verifique o console do navegador (F12)
2. Leia a mensagem de erro completa
3. Confirme que seguiu TODOS os passos
4. Verifique as regras do Firestore

---

**Boa atualização! 🚀**
