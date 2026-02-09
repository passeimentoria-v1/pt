import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Award, Lock, CheckCircle, Star, RefreshCw } from 'lucide-react';

export default function Conquistas() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      loadBadges();
    }
  }, [currentUser, userData]);

  const loadBadges = async () => {
    // Badges padrão do sistema
    const defaultBadges = [
      // INICIANTE
      {
        id: 'primeira_questao',
        name: 'Primeira Questão',
        description: 'Complete sua primeira questão',
        icon: '🎯',
        tier: 'bronze',
        requirement: { type: 'questions_completed', value: 1 },
        xpReward: 50
      },
      {
        id: 'dez_questoes',
        name: 'Estudante Dedicado',
        description: 'Complete 10 questões',
        icon: '📚',
        tier: 'prata',
        requirement: { type: 'questions_completed', value: 10 },
        xpReward: 100
      },
      {
        id: 'cinquenta_questoes',
        name: 'Maratonista',
        description: 'Complete 50 questões',
        icon: '🏃',
        tier: 'ouro',
        requirement: { type: 'questions_completed', value: 50 },
        xpReward: 200
      },
      {
        id: 'cem_questoes',
        name: 'Mestre do Conhecimento',
        description: 'Complete 100 questões',
        icon: '👑',
        tier: 'diamante',
        requirement: { type: 'questions_completed', value: 100 },
        xpReward: 500
      },

      // STREAK
      {
        id: 'streak_3',
        name: 'Constante',
        description: 'Mantenha 3 dias de sequência',
        icon: '🔥',
        tier: 'bronze',
        requirement: { type: 'streak', value: 3 },
        xpReward: 75
      },
      {
        id: 'streak_7',
        name: 'Sequência de Fogo',
        description: 'Mantenha 7 dias de sequência',
        icon: '🔥',
        tier: 'prata',
        requirement: { type: 'streak', value: 7 },
        xpReward: 150
      },
      {
        id: 'streak_30',
        name: 'Maratonista Inabalável',
        description: 'Mantenha 30 dias de sequência',
        icon: '🔥',
        tier: 'ouro',
        requirement: { type: 'streak', value: 30 },
        xpReward: 300
      },
      {
        id: 'streak_100',
        name: 'Lenda Vivente',
        description: 'Mantenha 100 dias de sequência',
        icon: '🔥',
        tier: 'diamante',
        requirement: { type: 'streak', value: 100 },
        xpReward: 1000
      },

      // NÍVEIS
      {
        id: 'nivel_5',
        name: 'Aprendiz',
        description: 'Alcance o nível 5',
        icon: '⭐',
        tier: 'bronze',
        requirement: { type: 'level', value: 5 },
        xpReward: 100
      },
      {
        id: 'nivel_10',
        name: 'Estudante Avançado',
        description: 'Alcance o nível 10',
        icon: '⭐',
        tier: 'prata',
        requirement: { type: 'level', value: 10 },
        xpReward: 200
      },
      {
        id: 'nivel_25',
        name: 'Expert',
        description: 'Alcance o nível 25',
        icon: '⭐',
        tier: 'ouro',
        requirement: { type: 'level', value: 25 },
        xpReward: 500
      },
      {
        id: 'nivel_50',
        name: 'Grande Mestre',
        description: 'Alcance o nível 50',
        icon: '⭐',
        tier: 'diamante',
        requirement: { type: 'level', value: 50 },
        xpReward: 1500
      },

      // ORTOGRAFIA
      {
        id: 'ortografia_10',
        name: 'Ortógrafo Iniciante',
        description: 'Acerte 10 questões de ortografia',
        icon: '📝',
        tier: 'bronze',
        requirement: { type: 'category_correct', category: 'ortografia', value: 10 },
        xpReward: 75
      },
      {
        id: 'ortografia_50',
        name: 'Mestre da Crase',
        description: 'Acerte 50 questões de ortografia',
        icon: '📝',
        tier: 'prata',
        requirement: { type: 'category_correct', category: 'ortografia', value: 50 },
        xpReward: 200
      },
      {
        id: 'ortografia_100',
        name: 'Ortógrafo Expert',
        description: 'Acerte 100 questões de ortografia',
        icon: '📝',
        tier: 'ouro',
        requirement: { type: 'category_correct', category: 'ortografia', value: 100 },
        xpReward: 400
      },

      // ESPECIAIS
      {
        id: 'primeira_batalha',
        name: 'Guerreiro',
        description: 'Vença sua primeira batalha',
        icon: '⚔️',
        tier: 'prata',
        requirement: { type: 'battles_won', value: 1 },
        xpReward: 150
      },
      {
        id: 'top10',
        name: 'Top 10',
        description: 'Entre no top 10 do ranking',
        icon: '🏆',
        tier: 'ouro',
        requirement: { type: 'ranking', value: 10 },
        xpReward: 300
      },
      {
        id: 'top1',
        name: 'Campeão',
        description: 'Alcance o 1º lugar no ranking',
        icon: '👑',
        tier: 'diamante',
        requirement: { type: 'ranking', value: 1 },
        xpReward: 1000
      }
    ];

    // Buscar badges customizadas do Firestore
    try {
      const badgesSnapshot = await getDocs(collection(db, 'badges'));
      const customBadges = badgesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllBadges([...defaultBadges, ...customBadges]);
    } catch (error) {
      setAllBadges(defaultBadges);
    }

    setLoading(false);
  };

  const checkAllBadges = async () => {
    setChecking(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const currentData = userDoc.data();
      const currentBadges = currentData.badges || [];
      const newBadges = [];

      for (const badge of allBadges) {
        // Se já tem a badge, pular
        if (currentBadges.includes(badge.id)) continue;

        let shouldUnlock = false;
        const req = badge.requirement;

        switch (req.type) {
          case 'questions_completed':
            shouldUnlock = (currentData.questionsCompleted || 0) >= req.value;
            break;
          case 'streak':
            shouldUnlock = (currentData.streak || 0) >= req.value;
            break;
          case 'level':
            shouldUnlock = (currentData.level || 1) >= req.value;
            break;
          case 'battles_won':
            shouldUnlock = (currentData.battlesWon || 0) >= req.value;
            break;
          case 'ranking':
            shouldUnlock = (currentData.rankingPosition || 999) <= req.value;
            break;
          case 'category_correct':
            shouldUnlock = (currentData[`${req.category}Correct`] || 0) >= req.value;
            break;
        }

        if (shouldUnlock) {
          newBadges.push(badge.id);
        }
      }

      // Atualizar no Firestore
      if (newBadges.length > 0) {
        await updateDoc(userRef, {
          badges: arrayUnion(...newBadges)
        });
        
        alert(`🎉 ${newBadges.length} conquista(s) desbloqueada(s)! Recarregando página...`);
        window.location.reload();
      } else {
        alert('✅ Todas as conquistas disponíveis já foram verificadas!');
      }
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      alert('Erro ao verificar conquistas. Tente novamente.');
    } finally {
      setChecking(false);
    }
  };

  const checkBadgeUnlocked = (badge) => {
    if (!userData) return false;

    // Verificar se já foi desbloqueada
    if (userData.badges?.includes(badge.id)) return true;

    return false;
  };

  const getBadgeProgress = (badge) => {
    if (!userData) return 0;

    const req = badge.requirement;
    let current = 0;

    switch (req.type) {
      case 'questions_completed':
        current = userData.questionsCompleted || 0;
        break;
      case 'streak':
        current = userData.streak || 0;
        break;
      case 'level':
        current = userData.level || 1;
        break;
      case 'battles_won':
        current = userData.battlesWon || 0;
        break;
      case 'ranking':
        current = userData.rankingPosition || 999;
        return current <= req.value ? 100 : 0; // Caso especial para ranking
      case 'category_correct':
        current = userData[`${req.category}Correct`] || 0;
        break;
      default:
        current = 0;
    }

    const progress = Math.min((current / req.value) * 100, 100);
    return { current, total: req.value, percentage: progress };
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return 'from-orange-600 to-orange-700';
      case 'prata': return 'from-gray-400 to-gray-500';
      case 'ouro': return 'from-yellow-500 to-yellow-600';
      case 'diamante': return 'from-cyan-400 to-blue-500';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getTierBorder = (tier) => {
    switch (tier) {
      case 'bronze': return 'border-orange-500';
      case 'prata': return 'border-gray-400';
      case 'ouro': return 'border-yellow-500';
      case 'diamante': return 'border-cyan-400';
      default: return 'border-gray-500';
    }
  };

  const groupByCategory = () => {
    const groups = {
      'Iniciante': [],
      'Sequência': [],
      'Níveis': [],
      'Categorias': [],
      'Especiais': []
    };

    allBadges.forEach(badge => {
      if (badge.requirement.type === 'questions_completed') {
        groups['Iniciante'].push(badge);
      } else if (badge.requirement.type === 'streak') {
        groups['Sequência'].push(badge);
      } else if (badge.requirement.type === 'level') {
        groups['Níveis'].push(badge);
      } else if (badge.requirement.type === 'category_correct') {
        groups['Categorias'].push(badge);
      } else {
        groups['Especiais'].push(badge);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando conquistas...</p>
        </div>
      </div>
    );
  }

  const badgeGroups = groupByCategory();
  const unlockedCount = allBadges.filter(b => checkBadgeUnlocked(b)).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/aluno')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          {/* Banner de Verificação */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">🎯 Completou alguma meta?</p>
                <p className="text-sm text-purple-100">Clique para verificar conquistas pendentes</p>
              </div>
              <button
                onClick={checkAllBadges}
                disabled={checking}
                className="flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Verificando...' : 'Verificar Agora'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Award className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Conquistas</h1>
                <p className="text-purple-100">Desbloqueie badges e mostre seu progresso</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <p className="text-4xl font-bold">{unlockedCount}/{allBadges.length}</p>
              <p className="text-sm text-purple-100">Desbloqueadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {Object.entries(badgeGroups).map(([category, badges]) => {
          if (badges.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Star className="w-6 h-6 text-purple-600" />
                <span>{category}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => {
                  const unlocked = checkBadgeUnlocked(badge);
                  const progress = getBadgeProgress(badge);
                  const isProgress = typeof progress === 'object';

                  return (
                    <div
                      key={badge.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 overflow-hidden transition ${
                        unlocked ? getTierBorder(badge.tier) : 'border-gray-200 dark:border-gray-700 opacity-60'
                      }`}
                    >
                      <div className={`h-2 bg-gradient-to-r ${getTierColor(badge.tier)}`}></div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`text-5xl ${!unlocked && 'grayscale opacity-50'}`}>
                              {badge.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {badge.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {badge.tier}
                              </p>
                            </div>
                          </div>
                          {unlocked ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-400" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {badge.description}
                        </p>

                        {!unlocked && isProgress && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progresso
                              </span>
                              <span className="text-sm font-medium text-purple-600">
                                {progress.current}/{progress.total}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${getTierColor(badge.tier)}`}
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                          <div className="flex items-center space-x-2 text-yellow-600">
                            <Award className="w-4 h-4" />
                            <span className="font-bold text-sm">+{badge.xpReward} XP</span>
                          </div>
                          {unlocked && (
                            <span className="text-xs text-green-600 font-medium">✓ Desbloqueada</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
