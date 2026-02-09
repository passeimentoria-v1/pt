import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Brain, CheckCircle, X, RotateCcw } from 'lucide-react';

export default function RevisaoInteligente() {
  const { currentUser, userData, addXP } = useAuth();
  const navigate = useNavigate();
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      loadWrongQuestions();
    }
  }, [currentUser, userData]);

  const loadWrongQuestions = async () => {
    try {
      // Buscar questões que o usuário errou
      const wrongAnswersQuery = query(
        collection(db, 'wrongAnswers'),
        where('userId', '==', currentUser.uid)
      );
      const snapshot = await getDocs(wrongAnswersQuery);
      
      const questionIds = [...new Set(snapshot.docs.map(doc => doc.data().questionId))];
      
      // Buscar detalhes das questões
      const questions = await Promise.all(
        questionIds.slice(0, 10).map(async (id) => {
          const questionDoc = await getDoc(doc(db, 'questions', id));
          if (questionDoc.exists()) {
            return { id: questionDoc.id, ...questionDoc.data() };
          }
          return null;
        })
      );

      setWrongQuestions(questions.filter(q => q !== null));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    const correct = selectedAnswer === wrongQuestions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      const xpGained = wrongQuestions[currentIndex].xpReward || 50;
      setScore(score + xpGained);
      addXP(xpGained);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < wrongQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(false);
    } else {
      // Fim da revisão
      alert(`Revisão concluída! Você ganhou ${score} XP total! 🎉`);
      navigate('/aluno');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando questões para revisão...</p>
        </div>
      </div>
    );
  }

  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Brain className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhuma questão para revisar</h2>
          <p className="text-gray-600 mb-6">
            Você não tem questões erradas registradas. Continue praticando!
          </p>
          <button
            onClick={() => navigate('/aluno')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = wrongQuestions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/aluno')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Revisão Inteligente</h1>
                <p className="text-purple-100 text-sm">Pratique questões que você errou</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100">Progresso</p>
              <p className="text-2xl font-bold">{currentIndex + 1}/{wrongQuestions.length}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {wrongQuestions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index < currentIndex
                    ? 'bg-green-400'
                    : index === currentIndex
                    ? 'bg-white'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-2 mb-4">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600 uppercase">
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
                bgColor = 'bg-purple-50';
                borderColor = 'border-purple-500';
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
                    <CheckCircle className="w-6 h-6 text-green-600" />
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
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                Confirmar Resposta
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className={`w-full py-4 rounded-xl font-bold text-lg transition ${
                  isCorrect
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {currentIndex < wrongQuestions.length - 1 ? 'Próxima Questão →' : 'Finalizar Revisão'}
              </button>
            )}
          </div>

          {showResult && (
            <div className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}>
              <p className={`font-bold text-center ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}>
                {isCorrect 
                  ? `🎉 Excelente! Você aprendeu! +${question.xpReward} XP` 
                  : '🤔 Revise a explicação e tente novamente mais tarde'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
