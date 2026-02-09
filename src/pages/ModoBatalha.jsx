import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, addDoc, query, where, onSnapshot, updateDoc, doc, getDocs, getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Swords, Trophy, Users, ArrowLeft, Clock, Zap } from 'lucide-react';

export default function ModoBatalha() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('lobby'); // lobby, waiting, battle, result
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [battleQuestions, setBattleQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [myAnswers, setMyAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [battleResult, setBattleResult] = useState(null);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
      return;
    }
    loadAvailablePlayers();
  }, [currentUser, userData]);

  // Timer para questões
  useEffect(() => {
    if (view === 'battle' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (view === 'battle' && timeLeft === 0) {
      handleTimeOut();
    }
  }, [view, timeLeft]);

  const loadAvailablePlayers = async () => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    );
    const snapshot = await getDocs(q);
    const players = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.id !== currentUser.uid);
    setAvailablePlayers(players);
  };

  const challengePlayer = async (opponentId) => {
    try {
      // Buscar 5 questões aleatórias
      const questionsSnapshot = await getDocs(collection(db, 'questions'));
      const allQuestions = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const selectedQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      // Criar batalha
      const battleRef = await addDoc(collection(db, 'battles'), {
        player1: currentUser.uid,
        player2: opponentId,
        status: 'waiting',
        questions: selectedQuestions.map(q => q.id),
        player1Answers: [],
        player2Answers: [],
        createdAt: new Date().toISOString()
      });

      setCurrentBattle({ id: battleRef.id, player2: opponentId });
      setBattleQuestions(selectedQuestions);
      setView('waiting');

      // Escutar mudanças na batalha
      const unsubscribe = onSnapshot(doc(db, 'battles', battleRef.id), (doc) => {
        const battle = doc.data();
        if (battle.status === 'accepted') {
          setView('battle');
          setTimeLeft(15);
        }
      });

      return unsubscribe;
    } catch (error) {
      alert('Erro ao criar batalha: ' + error.message);
    }
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
  };

  const confirmAnswer = async () => {
    const newAnswers = [...myAnswers, selectedAnswer];
    setMyAnswers(newAnswers);

    // Atualizar no Firestore
    await updateDoc(doc(db, 'battles', currentBattle.id), {
      player1Answers: newAnswers
    });

    if (currentQuestion < battleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      finishBattle();
    }
  };

  const handleTimeOut = () => {
    const newAnswers = [...myAnswers, -1]; // -1 = não respondeu
    setMyAnswers(newAnswers);

    if (currentQuestion < battleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(15);
    } else {
      finishBattle();
    }
  };

  const finishBattle = async () => {
    // Calcular pontuação
    let myScore = 0;
    myAnswers.forEach((answer, index) => {
      if (answer === battleQuestions[index].correctAnswer) {
        myScore++;
      }
    });

    // Aguardar oponente terminar
    const battleDoc = await getDoc(doc(db, 'battles', currentBattle.id));
    const battle = battleDoc.data();

    if (battle.player2Answers.length === 5) {
      // Calcular resultado
      let opponentScore = 0;
      battle.player2Answers.forEach((answer, index) => {
        if (answer === battleQuestions[index].correctAnswer) {
          opponentScore++;
        }
      });

      const result = {
        myScore,
        opponentScore,
        winner: myScore > opponentScore ? 'you' : myScore < opponentScore ? 'opponent' : 'draw'
      };

      setBattleResult(result);
      setView('result');
    } else {
      setView('waiting');
    }
  };

  if (view === 'lobby') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/aluno')}
              className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="flex items-center space-x-4">
              <Swords className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Modo Batalha 1v1</h1>
                <p className="text-red-100">Desafie outros alunos e mostre suas habilidades!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-2">Como Funciona</h2>
            <ul className="space-y-2 text-red-50">
              <li>⚔️ Escolha um oponente para desafiar</li>
              <li>📝 Vocês responderão as mesmas 5 questões</li>
              <li>⏱️ 15 segundos por questão</li>
              <li>🏆 Quem acertar mais ganha!</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Jogadores Disponíveis</h2>
          
          {availablePlayers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum jogador disponível no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlayers.map((player) => (
                <div key={player.id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200 hover:border-red-500 transition">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-600">Nível {player.level}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-red-600">{player.level}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">XP Total</span>
                    <span className="font-bold text-red-600">{player.xp}</span>
                  </div>

                  <button
                    onClick={() => challengePlayer(player.id)}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-red-600 hover:to-orange-600 transition flex items-center justify-center space-x-2"
                  >
                    <Swords className="w-5 h-5" />
                    <span>Desafiar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aguardando Oponente</h2>
          <p className="text-gray-600 mb-6">Esperando o outro jogador aceitar o desafio...</p>
          <button
            onClick={() => setView('lobby')}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Cancelar Desafio
          </button>
        </div>
      </div>
    );
  }

  if (view === 'battle' && battleQuestions.length > 0) {
    const question = battleQuestions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Swords className="w-6 h-6" />
                <span className="font-bold">Batalha em Progresso</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">{timeLeft}s</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {battleQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index < currentQuestion
                      ? 'bg-green-400'
                      : index === currentQuestion
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-white/80 mt-2 text-sm">
              Questão {currentQuestion + 1} de {battleQuestions.length}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h2>

            <div className="space-y-3">
              {question.alternatives.map((alt, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-xl border-2 text-left transition flex items-center space-x-3 ${
                    selectedAnswer === index
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  } ${selectedAnswer !== null ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-700">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium flex-1">{alt}</span>
                </button>
              ))}
            </div>

            <button
              onClick={confirmAnswer}
              disabled={selectedAnswer === null}
              className="w-full mt-8 bg-gradient-to-r from-red-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Resposta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result' && battleResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            battleResult.winner === 'you' ? 'bg-green-100' : 
            battleResult.winner === 'draw' ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Trophy className={`w-10 h-10 ${
              battleResult.winner === 'you' ? 'text-green-600' :
              battleResult.winner === 'draw' ? 'text-yellow-600' : 'text-red-600'
            }`} />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {battleResult.winner === 'you' ? 'Vitória!' :
             battleResult.winner === 'draw' ? 'Empate!' : 'Derrota'}
          </h2>
          
          <div className="bg-gray-50 rounded-xl p-6 my-6">
            <div className="flex items-center justify-center space-x-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Você</p>
                <p className="text-4xl font-bold text-red-600">{battleResult.myScore}</p>
              </div>
              <div className="text-2xl font-bold text-gray-400">×</div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Oponente</p>
                <p className="text-4xl font-bold text-orange-600">{battleResult.opponentScore}</p>
              </div>
            </div>
          </div>

          {battleResult.winner === 'you' && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-6 h-6 text-green-600" />
                <span className="text-2xl font-bold text-green-900">+150 XP</span>
              </div>
              <p className="text-sm text-green-700 mt-1">Bônus de Vitória!</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setView('lobby');
                setCurrentBattle(null);
                setBattleResult(null);
                setCurrentQuestion(0);
                setMyAnswers([]);
                loadAvailablePlayers();
              }}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-lg font-bold hover:from-red-600 hover:to-orange-600 transition"
            >
              Jogar Novamente
            </button>
            <button
              onClick={() => navigate('/aluno')}
              className="w-full border-2 border-red-500 text-red-600 py-3 rounded-lg font-bold hover:bg-red-50 transition"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <div>Carregando...</div>;
}
