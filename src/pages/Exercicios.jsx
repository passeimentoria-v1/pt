import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Check, X, Trophy, Zap } from 'lucide-react';

export default function Exercicios() {
  const { currentUser, userData, addXP, reloadUserData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const trilha = location.state?.trilha || 'Ortografia';

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [trilha]);

  const loadQuestions = async () => {
    const categoryMap = {
      'Ortografia': 'ortografia',
      'Gramática': 'gramatica',
      'Interpretação de Texto': 'interpretacao',
      'Redação': 'redacao'
    };

    const q = query(
      collection(db, 'questions'),
      where('category', '==', categoryMap[trilha] || 'ortografia')
    );
    
    const snapshot = await getDocs(q);
    const questionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // ALGORITMO MELHORADO: Evitar questões similares seguidas
    // 1. Agrupar por tema/palavra-chave
    const groupedByKeyword = {};
    questionsData.forEach(q => {
      // Extrair palavra-chave principal da pergunta (primeira palavra relevante)
      const words = q.question.toLowerCase().split(' ');
      const keyword = words.find(w => w.length > 4) || words[0];
      
      if (!groupedByKeyword[keyword]) {
        groupedByKeyword[keyword] = [];
      }
      groupedByKeyword[keyword].push(q);
    });

    // 2. Selecionar 1 questão de cada grupo primeiro (máxima variedade)
    const selected = [];
    const keywords = Object.keys(groupedByKeyword);
    
    // Embaralhar grupos
    const shuffledKeywords = keywords.sort(() => Math.random() - 0.5);
    
    // Pegar 1 de cada grupo até ter 5
    for (let i = 0; i < shuffledKeywords.length && selected.length < 5; i++) {
      const keyword = shuffledKeywords[i];
      const questionsInGroup = groupedByKeyword[keyword];
      const randomQuestion = questionsInGroup[Math.floor(Math.random() * questionsInGroup.length)];
      selected.push(randomQuestion);
    }
    
    // Se ainda não tiver 5, completar com questões aleatórias não selecionadas
    if (selected.length < 5) {
      const remaining = questionsData.filter(q => !selected.includes(q));
      const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
      selected.push(...shuffledRemaining.slice(0, 5 - selected.length));
    }
    
    // 3. Embaralhar resultado final
    const finalQuestions = selected.sort(() => Math.random() - 0.5);
    
    setQuestions(finalQuestions);
    setLoading(false);
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = async () => {
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const xpGained = questions[currentQuestion].xpReward || 50;
      setScore(score + xpGained);
      addXP(xpGained);

      // Incrementar contador de questões completadas
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          questionsCompleted: increment(1)
        });
      } catch (error) {
        console.error('Erro ao atualizar questionsCompleted:', error);
      }

      // Registrar progresso para missões semanais
      try {
        const getWeekNumber = () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);
          const diff = now - start;
          const oneWeek = 1000 * 60 * 60 * 24 * 7;
          return Math.floor(diff / oneWeek);
        };

        const currentWeek = getWeekNumber();
        const categoryMap = {
          'Ortografia': 'ortografia',
          'Gramática': 'gramatica',
          'Interpretação de Texto': 'interpretacao',
          'Redação': 'redacao'
        };
        const category = categoryMap[trilha] || 'ortografia';

        const progressRef = doc(db, 'weeklyProgress', `${currentUser.uid}_week${currentWeek}`);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
          const data = progressDoc.data();
          await updateDoc(progressRef, {
            questions_completed: (data.questions_completed || 0) + 1,
            [`${category}_completed`]: (data[`${category}_completed`] || 0) + 1,
            [`${category}_correct`]: (data[`${category}_correct`] || 0) + 1,
            gramatica_completed: category === 'gramatica' ? (data.gramatica_completed || 0) + 1 : (data.gramatica_completed || 0),
            ortografia_correct: category === 'ortografia' ? (data.ortografia_correct || 0) + 1 : (data.ortografia_correct || 0)
          });
        } else {
          await setDoc(progressRef, {
            week: currentWeek,
            questions_completed: 1,
            [`${category}_completed`]: 1,
            [`${category}_correct`]: 1,
            ortografia_correct: category === 'ortografia' ? 1 : 0,
            streak_days: userData?.streak || 0,
            gramatica_completed: category === 'gramatica' ? 1 : 0,
            daily_challenges: 0,
            completedMissions: []
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso semanal:', error);
      }
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      setFinished(true);
      
      // Salvar progresso
      await addDoc(collection(db, 'progress'), {
        userId: currentUser.uid,
        category: trilha,
        score,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString()
      });

      // Incrementar contador de exercícios completados
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          exercisesCompleted: increment(1)
        });
        
        // SALVAR PROGRESSO DA TRILHA ESPECÍFICA
        const categoryMap = {
          'Ortografia': 'ortografiaProgress',
          'Gramática': 'gramaticaProgress',
          'Interpretação de Texto': 'interpretacaoProgress',
          'Redação': 'redacaoProgress'
        };
        
        const progressField = categoryMap[trilha];
        
        // Incrementar progresso da trilha (cada exercício = 5%)
        const currentProgress = userData?.[progressField] || 0;
        const newProgress = Math.min(currentProgress + 5, 100);
        
        await updateDoc(userRef, {
          [progressField]: newProgress
        });
        
        console.log(`✅ Progresso de ${trilha} atualizado para ${newProgress}%`);
        console.log(`📊 Campo salvo: ${progressField}`);
        
        // RECARREGAR DADOS DO USUÁRIO
        await reloadUserData();
        console.log('✅ UserData recarregado após completar exercício');
        
        // Notificação visual
        setTimeout(() => {
          alert(`🎉 Parabéns! Progresso de ${trilha}: ${newProgress}%\n⭐ Continue estudando para ganhar mais estrelas!`);
        }, 500);
        
      } catch (error) {
        console.error('❌ Erro ao atualizar progresso:', error);
        console.error('❌ Detalhes:', error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questões...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhuma questão disponível para esta trilha ainda.</p>
          <button
            onClick={() => navigate('/aluno')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Parabéns!</h2>
          <p className="text-gray-600 mb-6">Você completou a trilha de {trilha}</p>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span className="text-4xl font-bold text-gray-900">+{score} XP</span>
            </div>
            <p className="text-gray-600">
              Você acertou {Math.round((score / (questions.length * 50)) * 100)}% das questões
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/aluno')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Voltar ao Dashboard
            </button>
            <button
              onClick={() => {
                setFinished(false);
                setCurrentQuestion(0);
                setScore(0);
                loadQuestions();
              }}
              className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Praticar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/aluno')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-yellow-600">
                <Zap className="w-5 h-5" />
                <span className="font-bold">{score} XP</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index < currentQuestion
                    ? 'bg-green-500'
                    : index === currentQuestion
                    ? 'bg-primary-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Questão {currentQuestion + 1} de {questions.length}
          </p>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {trilha}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h2>

          <div className="space-y-3">
            {question.alternatives.map((alt, index) => {
              const isSelected = selectedAnswer === index;
              const isAnswerCorrect = index === question.correctAnswer;
              
              let bgColor = 'bg-white hover:bg-gray-50';
              let borderColor = 'border-gray-200';
              
              if (showResult) {
                if (isAnswerCorrect) {
                  bgColor = 'bg-green-50';
                  borderColor = 'border-green-500';
                } else if (isSelected && !isAnswerCorrect) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-500';
                }
              } else if (isSelected) {
                bgColor = 'bg-primary-50';
                borderColor = 'border-primary-500';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 ${borderColor} ${bgColor} text-left transition flex items-center justify-between ${
                    !showResult ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{alt}</span>
                  </div>
                  
                  {showResult && isAnswerCorrect && (
                    <Check className="w-6 h-6 text-green-600" />
                  )}
                  {showResult && isSelected && !isAnswerCorrect && (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                </button>
              );
            })}
          </div>

          {showResult && question.explanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 Explicação:</p>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}

          <div className="mt-8">
            {!showResult ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
                className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                  isCorrect
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {currentQuestion < questions.length - 1 ? 'Próxima Questão →' : 'Ver Resultado'}
              </button>
            )}
          </div>

          {showResult && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`font-bold text-center ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect 
                  ? `🎉 Correto! +${question.xpReward} XP` 
                  : '❌ Incorreto. Continue praticando!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
