import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Trophy, Zap, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function DesafioDiario() {
  const { currentUser, userData, addXP } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      checkAndLoadDailyChallenge();
    }
  }, [currentUser, userData]);

  const getTodayString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const checkAndLoadDailyChallenge = async () => {
    const todayStr = getTodayString();
    
    // Verificar se já completou hoje
    const userChallengeRef = doc(db, 'dailyChallenges', currentUser.uid);
    const userChallengeDoc = await getDoc(userChallengeRef);
    
    if (userChallengeDoc.exists() && userChallengeDoc.data().lastCompleted === todayStr) {
      setAlreadyCompleted(true);
      setLoading(false);
      return;
    }

    // Buscar questão do dia
    const challengeRef = doc(db, 'dailyChallengeQuestions', todayStr);
    const challengeDoc = await getDoc(challengeRef);

    if (challengeDoc.exists()) {
      setQuestion(challengeDoc.data());
    } else {
      // Gerar nova questão do dia
      await generateDailyChallenge(todayStr);
    }

    setLoading(false);
  };

  const generateDailyChallenge = async (dateStr) => {
    // Buscar todas as questões
    const questionsSnapshot = await getDocs(collection(db, 'questions'));
    const allQuestions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (allQuestions.length === 0) {
      setQuestion(null);
      return;
    }

    // Selecionar questão aleatória baseada na data (sempre a mesma para o dia)
    const seed = dateStr.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const index = seed % allQuestions.length;
    const selectedQuestion = allQuestions[index];

    // Salvar questão do dia
    const challengeRef = doc(db, 'dailyChallengeQuestions', dateStr);
    await setDoc(challengeRef, selectedQuestion);

    setQuestion(selectedQuestion);
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = async () => {
    const correct = selectedAnswer === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const xpGained = (question.xpReward || 50) * 2; // XP em dobro!
      await addXP(xpGained);

      // Marcar como completado
      const todayStr = getTodayString();
      const userChallengeRef = doc(db, 'dailyChallenges', currentUser.uid);
      await setDoc(userChallengeRef, {
        lastCompleted: todayStr,
        totalCompleted: (userData.dailyChallengesCompleted || 0) + 1,
        xpEarned: xpGained
      });

      // Incrementar contador no perfil do usuário
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        dailyChallengesCompleted: increment(1)
      });

      // Atualizar progresso semanal para missões
      try {
        const getWeekNumber = () => {
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);
          const diff = now - start;
          const oneWeek = 1000 * 60 * 60 * 24 * 7;
          return Math.floor(diff / oneWeek);
        };

        const currentWeek = getWeekNumber();
        const progressRef = doc(db, 'weeklyProgress', `${currentUser.uid}_week${currentWeek}`);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
          const data = progressDoc.data();
          await updateDoc(progressRef, {
            daily_challenges: (data.daily_challenges || 0) + 1
          });
        } else {
          await setDoc(progressRef, {
            week: currentWeek,
            questions_completed: 0,
            ortografia_correct: 0,
            streak_days: userData?.streak || 0,
            gramatica_completed: 0,
            daily_challenges: 1,
            completedMissions: []
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso semanal:', error);
      }

      // Atualizar streak se necessário
      const lastStudy = userData.lastStudyDate;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (!lastStudy || new Date(lastStudy).toDateString() === yesterday.toDateString()) {
        // Incrementar streak
        await updateDoc(userRef, {
          streak: increment(1),
          lastStudyDate: today.toISOString()
        });
      }

      setCompletedToday(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando desafio do dia...</p>
        </div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Desafio Concluído!</h2>
          <p className="text-gray-600 mb-6">
            Você já completou o desafio de hoje. Volte amanhã para um novo desafio!
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span>Próximo desafio em:</span>
            </div>
            <p className="text-2xl font-bold text-primary-600 mt-2">
              {new Date(new Date().setHours(24,0,0,0) - new Date()).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <button
            onClick={() => navigate('/aluno')}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Nenhuma questão disponível para o desafio de hoje.</p>
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

  if (completedToday) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Incrível!</h2>
          <p className="text-gray-600 mb-6">Você completou o desafio diário!</p>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              <span className="text-5xl font-bold text-gray-900">+{(question.xpReward || 50) * 2}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">XP em Dobro! 🎉</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/aluno')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Voltar ao Dashboard
            </button>
            <button
              onClick={() => navigate('/exercicios')}
              className="w-full border-2 border-primary-600 text-primary-600 py-3 rounded-lg font-medium hover:bg-primary-50 transition"
            >
              Continuar Praticando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/aluno')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-6 h-6" />
                <h1 className="text-2xl font-bold">Desafio Diário</h1>
              </div>
              <p className="text-yellow-100">
                Complete para ganhar <strong>XP em DOBRO!</strong>
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <Zap className="w-6 h-6 mx-auto mb-1" />
              <p className="text-2xl font-bold">+{(question.xpReward || 50) * 2}</p>
              <p className="text-xs text-yellow-100">XP Possível</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-4">
            <span className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              <Trophy className="w-4 h-4" />
              <span>Desafio do Dia</span>
            </span>
          </div>

          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {question.category}
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
                bgColor = 'bg-yellow-50';
                borderColor = 'border-yellow-500';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 ${borderColor} ${bgColor} text-left transition flex items-center space-x-3 ${
                    !showResult ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium flex-1">{alt}</span>
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
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Resposta
              </button>
            ) : (
              <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-bold text-center text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect 
                    ? `🎉 Parabéns! Você ganhou +${(question.xpReward || 50) * 2} XP!` 
                    : '❌ Não foi dessa vez. Tente novamente amanhã!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
