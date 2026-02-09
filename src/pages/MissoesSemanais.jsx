import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Target, Trophy, Clock, CheckCircle, Lock } from 'lucide-react';

export default function MissoesSemanais() {
  const { currentUser, userData, addXP } = useAuth();
  const navigate = useNavigate();
  const [missions, setMissions] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      loadMissions();
    }
  }, [currentUser, userData]);

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const loadMissions = async () => {
    const currentWeek = getWeekNumber();
    
    // Missões padrão da semana
    const weeklyMissions = [
      {
        id: 'mission1',
        title: 'Maratonista Iniciante',
        description: 'Complete 10 questões em qualquer categoria',
        target: 10,
        reward: 200,
        icon: '🎯',
        type: 'questions_completed'
      },
      {
        id: 'mission2',
        title: 'Especialista em Ortografia',
        description: 'Acerte 5 questões de ortografia',
        target: 5,
        reward: 150,
        icon: '📝',
        type: 'ortografia_correct'
      },
      {
        id: 'mission3',
        title: 'Sequência Perfeita',
        description: 'Mantenha 5 dias consecutivos de streak',
        target: 5,
        reward: 300,
        icon: '🔥',
        type: 'streak_days'
      },
      {
        id: 'mission4',
        title: 'Gramática Master',
        description: 'Complete 8 questões de gramática',
        target: 8,
        reward: 175,
        icon: '📖',
        type: 'gramatica_completed'
      },
      {
        id: 'mission5',
        title: 'Desafio Diário Dedicado',
        description: 'Complete 3 desafios diários esta semana',
        target: 3,
        reward: 250,
        icon: '⭐',
        type: 'daily_challenges'
      }
    ];

    setMissions(weeklyMissions);

    // Carregar progresso do usuário
    const progressRef = doc(db, 'weeklyProgress', `${currentUser.uid}_week${currentWeek}`);
    const progressDoc = await getDoc(progressRef);
    
    if (progressDoc.exists()) {
      setUserProgress(progressDoc.data());
    } else {
      // Inicializar progresso
      const initialProgress = {
        week: currentWeek,
        questions_completed: 0,
        ortografia_correct: 0,
        streak_days: userData?.streak || 0,
        gramatica_completed: 0,
        daily_challenges: 0,
        completedMissions: []
      };
      await setDoc(progressRef, initialProgress);
      setUserProgress(initialProgress);
    }

    setLoading(false);
  };

  const claimReward = async (mission) => {
    if (userProgress[mission.type] >= mission.target && !userProgress.completedMissions?.includes(mission.id)) {
      // Adicionar XP
      await addXP(mission.reward);
      
      // Atualizar progresso
      const currentWeek = getWeekNumber();
      const progressRef = doc(db, 'weeklyProgress', `${currentUser.uid}_week${currentWeek}`);
      await updateDoc(progressRef, {
        completedMissions: [...(userProgress.completedMissions || []), mission.id]
      });

      setUserProgress(prev => ({
        ...prev,
        completedMissions: [...(prev.completedMissions || []), mission.id]
      }));

      alert(`Parabéns! Você ganhou +${mission.reward} XP! 🎉`);
    }
  };

  const calculateProgress = (mission) => {
    const current = userProgress[mission.type] || 0;
    const percentage = Math.min((current / mission.target) * 100, 100);
    return { current, percentage };
  };

  const isMissionCompleted = (missionId) => {
    return userProgress.completedMissions?.includes(missionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando missões...</p>
        </div>
      </div>
    );
  }

  const daysUntilReset = 7 - (new Date().getDay());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/aluno')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Missões Semanais</h1>
                <p className="text-purple-100">Complete missões e ganhe recompensas especiais!</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-5 h-5" />
                <span className="font-bold">Renovação</span>
              </div>
              <p className="text-2xl font-bold">{daysUntilReset}d</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Como Funcionam as Missões</h2>
          <ul className="space-y-2 text-purple-50">
            <li>🎯 Complete os objetivos durante a semana</li>
            <li>🏆 Reivindique suas recompensas ao atingir as metas</li>
            <li>🔄 Novas missões toda semana (segunda-feira)</li>
            <li>💎 Quanto mais difícil, maior a recompensa!</li>
          </ul>
        </div>

        {/* Lista de Missões */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map((mission) => {
            const { current, percentage } = calculateProgress(mission);
            const completed = isMissionCompleted(mission.id);
            const canClaim = current >= mission.target && !completed;

            return (
              <div 
                key={mission.id}
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden ${
                  completed ? 'border-green-500' : 
                  canClaim ? 'border-purple-500' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{mission.icon}</div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{mission.title}</h3>
                        <p className="text-sm text-gray-600">{mission.description}</p>
                      </div>
                    </div>
                    {completed && (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    )}
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progresso: {current}/{mission.target}
                      </span>
                      <span className="text-sm font-medium text-purple-600">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          completed ? 'bg-green-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Recompensa e Ação */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <span className="font-bold text-purple-600">+{mission.reward} XP</span>
                    </div>
                    
                    {completed ? (
                      <div className="flex items-center space-x-2 text-green-600 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        <span>Concluída</span>
                      </div>
                    ) : canClaim ? (
                      <button
                        onClick={() => claimReward(mission)}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition"
                      >
                        Resgatar
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <Lock className="w-5 h-5" />
                        <span className="text-sm">Bloqueada</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estatísticas da Semana */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo da Semana</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{userProgress.questions_completed || 0}</p>
              <p className="text-sm text-gray-600">Questões Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{userProgress.ortografia_correct || 0}</p>
              <p className="text-sm text-gray-600">Ortografia Corretas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{userProgress.streak_days || 0}</p>
              <p className="text-sm text-gray-600">Dias de Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{userProgress.gramatica_completed || 0}</p>
              <p className="text-sm text-gray-600">Gramática Completadas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{userProgress.daily_challenges || 0}</p>
              <p className="text-sm text-gray-600">Desafios Diários</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
