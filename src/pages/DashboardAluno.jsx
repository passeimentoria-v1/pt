import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Target, Flame, Star, TrendingUp, 
  BookOpen, LogOut, Award, Zap, Calendar, Users,
  Swords, Brain, Moon, Sun, User, ShoppingBag
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import EntrarTurma from '../components/EntrarTurma';
import AvatarSelector from '../components/AvatarSelector';
import Confetti from '../components/Confetti';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardAluno() {
  const { userData, currentUser, signOut, reloadUserData } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [ranking, setRanking] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showEntrarTurma, setShowEntrarTurma] = useState(false);
  const [userTurmas, setUserTurmas] = useState([]);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(userData?.avatar || '👨‍🎓');

  // CALCULAR PROGRESSO REAL DAS TRILHAS
  const ortografiaProgress = userData?.ortografiaProgress || 0;
  const gramaticaProgress = userData?.gramaticaProgress || 0;
  const interpretacaoProgress = userData?.interpretacaoProgress || 0;
  const redacaoProgress = userData?.redacaoProgress || 0;

  // Calcular estrelas (cada 33% = 1 estrela)
  const getStars = (progress) => {
    if (progress >= 67) return 3;
    if (progress >= 34) return 2;
    if (progress >= 1) return 1;
    return 0;
  };

  const ortografiaStars = getStars(ortografiaProgress);
  const gramaticaStars = getStars(gramaticaProgress);
  const interpretacaoStars = getStars(interpretacaoProgress);
  const redacaoStars = getStars(redacaoProgress);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      // Recarregar dados do usuário ao montar componente
      reloadUserData();
      loadRanking();
      loadBadges();
      loadUserTurmas();
    }
  }, [currentUser, userData?.role, navigate]);

  const loadRanking = async () => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student'),
      orderBy('xp', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    setRanking(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadBadges = async () => {
    const q = query(collection(db, 'badges'));
    const snapshot = await getDocs(q);
    setBadges(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadUserTurmas = async () => {
    const q = query(
      collection(db, 'turmas'),
      where('students', 'array-contains', currentUser.uid)
    );
    const snapshot = await getDocs(q);
    setUserTurmas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const progressToNextLevel = ((userData?.xp || 0) % 100);
  const currentPosition = ranking.findIndex(u => u.id === currentUser?.uid) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Identidade EstudeAntes (Preto e Amarelo) */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white dark:from-black dark:to-gray-900 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAvatarSelector(true)}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl hover:ring-4 hover:ring-yellow-400 transition cursor-pointer border-2 border-yellow-400"
              >
                {currentAvatar}
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{userData?.name}</h1>
                  {userData?.purchasedItems?.includes('titulo_estudioso') && (
                    <span className="text-sm bg-blue-500 px-2 py-1 rounded">📚 O Estudioso</span>
                  )}
                  {userData?.purchasedItems?.includes('titulo_guerreiro') && (
                    <span className="text-sm bg-red-500 px-2 py-1 rounded">⚔️ O Guerreiro</span>
                  )}
                  {userData?.purchasedItems?.includes('titulo_mestre') && (
                    <span className="text-sm bg-yellow-500 text-black px-2 py-1 rounded font-bold">👑 Mestre do Português</span>
                  )}
                </div>
                {/* Texto secundário em Amarelo para destaque no fundo preto */}
                <p className="text-yellow-400 font-medium">Nível {userData?.level || 1}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-white/10 hover:bg-red-500/20 px-4 py-2 rounded-lg transition hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-bold text-yellow-100">{userData?.xp || 0} XP</span>
              <span className="text-gray-400">Próximo nível: {(userData?.level || 1) + 1}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600">
              <div
                className="bg-yellow-400 h-3 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                style={{ width: `${progressToNextLevel}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">XP Total</p>
                    <p className="text-3xl font-bold text-gray-900">{userData?.xp || 0}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Sequência</p>
                    <p className="text-3xl font-bold text-gray-900">{userData?.streak || 0}</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Conquistas</p>
                    <p className="text-3xl font-bold text-gray-900">{userData?.badges?.length || 0}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Posição no Ranking</p>
                    <p className="text-3xl font-bold text-gray-900">#{currentPosition || '-'}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            {/* Desafio Diário Banner */}
            <button
              onClick={() => navigate('/desafio-diario')}
              className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left relative overflow-hidden border border-yellow-500/30"
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-xl font-bold text-yellow-400">Desafio Diário</h3>
                  </div>
                  <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-yellow-400/50">
                    <span className="text-sm font-bold text-yellow-300">XP em DOBRO!</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-3">Complete 1 questão especial e ganhe recompensa em dobro</p>
                <div className="inline-flex items-center space-x-2 bg-yellow-400 text-black rounded-lg px-4 py-2 hover:bg-yellow-300 transition">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Fazer Desafio →</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 text-9xl opacity-10">🏆</div>
            </button>

            {/* Ações Rápidas - Cores mais sóbrias ou alinhadas com amarelo/preto onde possível, mas mantendo a distinção */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/modo-batalha')}
                className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left"
              >
                <Swords className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Modo Batalha</h3>
                <p className="text-sm text-white/80">Desafie 1v1</p>
              </button>

              <button
                onClick={() => navigate('/missoes')}
                className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left border-b-4 border-yellow-400"
              >
                <Target className="w-8 h-8 mb-3 text-yellow-400" />
                <h3 className="font-bold text-lg mb-1">Missões</h3>
                <p className="text-sm text-white/80">Recompensas semanais</p>
              </button>

              <button
                onClick={() => navigate('/revisao')}
                className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left"
              >
                <Brain className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Revisão</h3>
                <p className="text-sm text-white/80">Pratique erros</p>
              </button>

              <button
                onClick={() => navigate('/estatisticas')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left"
              >
                <TrendingUp className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Estatísticas</h3>
                <p className="text-sm text-white/80">Sua evolução</p>
              </button>

              <button
                onClick={() => navigate('/conquistas')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left"
              >
                <Award className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg mb-1">Conquistas</h3>
                <p className="text-sm text-white/80">Seus Badges</p>
              </button>

              <button
                onClick={() => navigate('/loja')}
                className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-xl shadow-lg p-6 hover:shadow-xl transition text-left"
              >
                <ShoppingBag className="w-8 h-8 mb-3 text-black" />
                <h3 className="font-bold text-lg mb-1">Loja</h3>
                <p className="text-sm text-black/70">Troque XP por itens</p>
              </button>
            </div>

            {/* Minhas Turmas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-900" />
                  <h3 className="text-lg font-bold text-gray-900">Minhas Turmas</h3>
                </div>
                <button
                  onClick={() => setShowEntrarTurma(true)}
                  className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                >
                  + Entrar em Turma
                </button>
              </div>
              
              {userTurmas.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm mb-3">Você ainda não está em nenhuma turma</p>
                  <button
                    onClick={() => setShowEntrarTurma(true)}
                    className="inline-flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition text-sm border-b-2 border-yellow-400"
                  >
                    <Users className="w-4 h-4 text-yellow-400" />
                    <span>Entrar em uma Turma</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTurmas.map((turma) => (
                    <div key={turma.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{turma.emoji || '📚'}</span>
                        <div>
                          <p className="font-medium text-gray-900">{turma.name}</p>
                          <p className="text-xs text-gray-600">{turma.students?.length || 0} alunos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ranking */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-900">Top 10 Ranking</h2>
            </div>
            <div className="space-y-3">
              {ranking.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    user.id === currentUser?.uid ? 'bg-yellow-50 border border-yellow-300 shadow-sm' : 'bg-gray-50'
                  }`}
                >
                  <span className={`font-bold text-lg ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-orange-600' : 'text-gray-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${user.id === currentUser?.uid ? 'text-black font-bold' : ''}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">Nível {user.level}</p>
                  </div>
                  <span className={`font-bold ${user.id === currentUser?.uid ? 'text-black' : 'text-gray-600'}`}>
                    {user.xp} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trilha de Aprendizado SUPER LÚDICA */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🗺️ Sua Jornada</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Avance no mapa e domine o conteúdo!</p>
            </div>
          </div>

          <div className="bg-gradient-to-b from-sky-100 via-white to-yellow-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8 lg:p-12 overflow-hidden relative border-t-4 border-black">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-10 right-10 text-8xl opacity-10 animate-bounce">☁️</div>
            <div className="absolute bottom-10 left-10 text-6xl opacity-10">🌳</div>
            <div className="absolute top-1/2 right-20 text-5xl opacity-10 animate-pulse">⭐</div>
            
            {/* Caminho Visual com Cenários */}
            <div className="relative max-w-4xl mx-auto">
              {/* Linha do caminho */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                    <stop offset="25%" stopColor="#34d399" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.8" />
                    <stop offset="75%" stopColor="#fb923c" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
                  </linearGradient>
                  
                  {/* Padrão de pontos no caminho */}
                  <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="white" opacity="0.5"/>
                  </pattern>
                </defs>
                
                {/* Caminho principal */}
                <path
                  d="M 50% 80 
                     Q 65% 180, 45% 280 
                     Q 25% 380, 55% 480
                     Q 75% 580, 45% 680
                     Q 20% 780, 50% 880"
                  stroke="url(#pathGradient)"
                  strokeWidth="20"
                  fill="none"
                  strokeLinecap="round"
                />
                
                {/* Borda decorativa */}
                <path
                  d="M 50% 80 
                     Q 65% 180, 45% 280 
                     Q 25% 380, 55% 480
                     Q 75% 580, 45% 680
                     Q 20% 780, 50% 880"
                  stroke="url(#dots)"
                  strokeWidth="24"
                  fill="none"
                  opacity="0.3"
                />
              </svg>

              {/* Níveis com Cenários e Personagens */}
              <div className="space-y-20 relative" style={{ zIndex: 1 }}>
                
                {/* NÍVEL 1 - Floresta da Ortografia */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    {/* Cenário de fundo */}
                    <div className="absolute -inset-16 bg-green-100/50 dark:bg-green-900/20 rounded-full blur-2xl"></div>
                    
                    {/* Botão Principal */}
                    <button
                      onClick={() => navigate('/exercicios', { state: { trilha: 'Ortografia' } })}
                      className="relative w-36 h-36 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex flex-col items-center justify-center text-white hover:scale-110 active:scale-95 border-4 border-white dark:border-gray-700"
                    >
                      <div className="absolute -top-8 text-5xl animate-bounce">🦉</div>
                      <BookOpen className="w-14 h-14 mb-2 drop-shadow-lg" />
                      <span className="text-sm font-black uppercase tracking-wider drop-shadow-md">Nível 1</span>
                      
                      {/* Estrelas de progresso */}
                      <div className="absolute -bottom-4 flex space-x-1">
                        <span className={`text-2xl drop-shadow-md ${ortografiaStars >= 1 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${ortografiaStars >= 2 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${ortografiaStars >= 3 ? '' : 'opacity-30'}`}>⭐</span>
                      </div>
                    </button>
                    
                    {/* Card de Info Expandido */}
                    <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 min-w-[280px] border-4 border-blue-500">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">🌲 Floresta da Ortografia</h3>
                            <p className="text-xs text-gray-500">Região Iniciante</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Domine acentuação, pontuação e escrita correta nesta floresta mágica!
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                            <span className="font-bold text-blue-600">{Math.round(ortografiaProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full relative" style={{ width: `${ortografiaProgress}%` }}>
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <span className="text-xs text-gray-500">XP por lição</span>
                          <span className="font-bold text-yellow-600">+50 XP</span>
                        </div>
                      </div>
                      {/* Seta apontando */}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-[-12px]">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-blue-500 border-b-8 border-b-transparent"></div>
                      </div>
                    </div>

                    {/* Elementos decorativos */}
                    <div className="absolute -left-12 top-0 text-3xl animate-bounce delay-100">🍃</div>
                    <div className="absolute -right-12 bottom-0 text-3xl animate-bounce delay-200">🦋</div>
                  </div>
                </div>

                {/* NÍVEL 2 - Montanha da Gramática */}
                <div className="flex items-center justify-center">
                  <div className="relative group" style={{ marginLeft: '-180px' }}>
                    <div className="absolute -inset-16 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-2xl"></div>
                    
                    <button
                      onClick={() => navigate('/exercicios', { state: { trilha: 'Gramática' } })}
                      className="relative w-36 h-36 bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700 rounded-full shadow-2xl hover:shadow-green-500/50 transition-all duration-300 flex flex-col items-center justify-center text-white hover:scale-110 active:scale-95 border-4 border-white dark:border-gray-700"
                    >
                      <div className="absolute -top-8 text-5xl animate-bounce delay-75">🦅</div>
                      <Target className="w-14 h-14 mb-2 drop-shadow-lg" />
                      <span className="text-sm font-black uppercase tracking-wider drop-shadow-md">Nível 2</span>
                      
                      <div className="absolute -bottom-4 flex space-x-1">
                        <span className={`text-2xl drop-shadow-md ${gramaticaStars >= 1 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${gramaticaStars >= 2 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${gramaticaStars >= 3 ? '' : 'opacity-30'}`}>⭐</span>
                      </div>
                    </button>
                    
                    <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 min-w-[280px] border-4 border-green-500">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">⛰️ Montanha da Gramática</h3>
                            <p className="text-xs text-gray-500">Região Intermediária</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Escale os picos das regras gramaticais e estruturas da língua!
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                            <span className="font-bold text-green-600">{Math.round(gramaticaProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" style={{ width: `${gramaticaProgress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <span className="text-xs text-gray-500">XP por lição</span>
                          <span className="font-bold text-yellow-600">+75 XP</span>
                        </div>
                      </div>
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-[-12px]">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-green-500 border-b-8 border-b-transparent"></div>
                      </div>
                    </div>

                    <div className="absolute -left-12 top-0 text-3xl animate-bounce delay-150">⛰️</div>
                    <div className="absolute -right-12 bottom-0 text-3xl animate-bounce delay-300">🪨</div>
                  </div>
                </div>

                {/* NÍVEL 3 - Castelo da Interpretação */}
                <div className="flex items-center justify-center">
                  <div className="relative group" style={{ marginLeft: '180px' }}>
                    <div className="absolute -inset-16 bg-purple-100/50 dark:bg-purple-900/20 rounded-full blur-2xl"></div>
                    
                    <button
                      onClick={() => navigate('/exercicios', { state: { trilha: 'Interpretação de Texto' } })}
                      className="relative w-36 h-36 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 hover:from-purple-500 hover:via-purple-600 hover:to-purple-700 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex flex-col items-center justify-center text-white hover:scale-110 active:scale-95 border-4 border-white dark:border-gray-700"
                    >
                      <div className="absolute -top-8 text-5xl animate-bounce delay-100">🧙</div>
                      <Star className="w-14 h-14 mb-2 drop-shadow-lg" />
                      <span className="text-sm font-black uppercase tracking-wider drop-shadow-md">Nível 3</span>
                      
                      <div className="absolute -bottom-4 flex space-x-1">
                        <span className={`text-2xl drop-shadow-md ${interpretacaoStars >= 1 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${interpretacaoStars >= 2 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${interpretacaoStars >= 3 ? '' : 'opacity-30'}`}>⭐</span>
                      </div>
                    </button>
                    
                    <div className="absolute right-full mr-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 min-w-[280px] border-4 border-purple-500">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">🏰 Castelo da Interpretação</h3>
                            <p className="text-xs text-gray-500">Região Avançada</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Desvende os mistérios da compreensão textual neste castelo ancestral!
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                            <span className="font-bold text-purple-600">{Math.round(interpretacaoProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full" style={{ width: `${interpretacaoProgress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <span className="text-xs text-gray-500">XP por lição</span>
                          <span className="font-bold text-yellow-600">+100 XP</span>
                        </div>
                      </div>
                      <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-[-12px]">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-purple-500 border-b-8 border-b-transparent"></div>
                      </div>
                    </div>

                    <div className="absolute -left-12 top-0 text-3xl animate-bounce delay-200">📚</div>
                    <div className="absolute -right-12 bottom-0 text-3xl animate-bounce delay-100">✨</div>
                  </div>
                </div>

                {/* NÍVEL 4 - Vulcão da Redação */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-16 bg-orange-100/50 dark:bg-orange-900/20 rounded-full blur-2xl"></div>
                    
                    <button
                      onClick={() => navigate('/exercicios', { state: { trilha: 'Redação' } })}
                      className="relative w-36 h-36 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 hover:from-orange-500 hover:via-orange-600 hover:to-red-600 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 flex flex-col items-center justify-center text-white hover:scale-110 active:scale-95 border-4 border-white dark:border-gray-700"
                    >
                      <div className="absolute -top-8 text-5xl animate-bounce delay-200">🐉</div>
                      <TrendingUp className="w-14 h-14 mb-2 drop-shadow-lg" />
                      <span className="text-sm font-black uppercase tracking-wider drop-shadow-md">Nível 4</span>
                      
                      <div className="absolute -bottom-4 flex space-x-1">
                        <span className={`text-2xl drop-shadow-md ${redacaoStars >= 1 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${redacaoStars >= 2 ? '' : 'opacity-30'}`}>⭐</span>
                        <span className={`text-2xl drop-shadow-md ${redacaoStars >= 3 ? '' : 'opacity-30'}`}>⭐</span>
                      </div>
                    </button>
                    
                    <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 min-w-[280px] border-4 border-orange-500">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-gray-900 dark:text-white">🌋 Vulcão da Redação</h3>
                            <p className="text-xs text-gray-500">Região Expert</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Forje suas habilidades de escrita no calor deste vulcão poderoso!
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                            <span className="font-bold text-orange-600">{Math.round(redacaoProgress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: `${redacaoProgress}%` }}></div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                          <span className="text-xs text-gray-500">XP por lição</span>
                          <span className="font-bold text-yellow-600">+150 XP</span>
                        </div>
                      </div>
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-[-12px]">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-orange-500 border-b-8 border-b-transparent"></div>
                      </div>
                    </div>

                    <div className="absolute -left-12 top-0 text-3xl animate-bounce delay-300">🔥</div>
                    <div className="absolute -right-12 bottom-0 text-3xl animate-bounce delay-150">💥</div>
                  </div>
                </div>

                {/* CHECKPOINT FINAL - Templo Dourado */}
                <div className="flex items-center justify-center">
                  <div className="relative group">
                    <div className="absolute -inset-20 bg-yellow-100/80 dark:bg-yellow-900/30 rounded-full blur-3xl animate-pulse"></div>
                    
                    <button
                      disabled
                      className="relative w-44 h-44 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-full shadow-[0_0_60px_rgba(251,191,36,0.6)] flex flex-col items-center justify-center text-white cursor-not-allowed opacity-70 border-8 border-white dark:border-gray-700"
                    >
                      <div className="absolute -top-12 text-7xl animate-bounce">👑</div>
                      <Trophy className="w-16 h-16 mb-2 drop-shadow-2xl animate-pulse" />
                      <span className="text-base font-black uppercase tracking-widest drop-shadow-lg">MESTRE</span>
                      
                      <div className="absolute -top-2 -right-2 w-14 h-14 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-xl border-4 border-yellow-400">
                        <span className="text-4xl">🔒</span>
                      </div>
                      
                      {/* Raios de luz */}
                      <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
                      </div>
                    </button>
                    
                    <div className="absolute left-full ml-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-95 group-hover:scale-100">
                      <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 rounded-2xl shadow-2xl p-6 min-w-[300px] border-4 border-white">
                        <div className="flex items-center space-x-3 mb-3">
                          <Trophy className="w-10 h-10 text-white drop-shadow-lg" />
                          <div>
                            <h3 className="font-black text-xl text-white drop-shadow-md">🏛️ Templo Dourado</h3>
                            <p className="text-xs text-yellow-100">Região Lendária</p>
                          </div>
                        </div>
                        
                        <p className="text-sm text-white mb-4 drop-shadow-sm">
                          Complete todos os 4 níveis para desbloquear o Templo Dourado e tornar-se um MESTRE do Português!
                        </p>
                        
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
                          <p className="text-xs font-bold text-white mb-2">🎁 Recompensas Épicas:</p>
                          <ul className="text-xs text-yellow-100 space-y-1">
                            <li>• 1000 XP de Bônus</li>
                            <li>• Badge Exclusivo "Mestre"</li>
                            <li>• Acesso a Conteúdo Especial</li>
                            <li>• Certificado Digital</li>
                          </ul>
                        </div>
                      </div>
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-[-12px]">
                        <div className="w-0 h-0 border-t-12 border-t-transparent border-r-12 border-r-yellow-400 border-b-12 border-b-transparent"></div>
                      </div>
                    </div>

                    <div className="absolute -left-16 top-1/2 text-4xl animate-bounce delay-100">✨</div>
                    <div className="absolute -right-16 top-1/2 text-4xl animate-bounce delay-200">✨</div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-3xl animate-bounce delay-300">💫</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica Lúdica no rodapé */}
            <div className="mt-16 relative">
              <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl shadow-xl p-1 border border-yellow-500">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <span className="text-3xl animate-bounce">🎮</span>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">Dica do Guia</h3>
                    <span className="text-3xl animate-bounce delay-100">🗺️</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    Complete os níveis em ordem! Cada região desbloqueada te deixa mais próximo de se tornar um <span className="text-yellow-500 font-black">MESTRE</span>!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        {badges.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Suas Conquistas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {badges.map((badge) => {
                const hasEarned = userData?.badges?.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`bg-white rounded-xl shadow-sm p-4 text-center ${
                      hasEarned ? 'border-2 border-yellow-400' : 'opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Entrar em Turma */}
      {showEntrarTurma && (
        <EntrarTurma
          onClose={() => setShowEntrarTurma(false)}
          onSuccess={() => {
            setShowEntrarTurma(false);
            loadUserTurmas();
          }}
        />
      )}

      {/* Modal Avatar Selector */}
      {showAvatarSelector && (
        <AvatarSelector
          onClose={() => setShowAvatarSelector(false)}
          onSuccess={(newAvatar) => {
            setCurrentAvatar(newAvatar);
            setShowAvatarSelector(false);
            setShowConfetti(true);
          }}
        />
      )}

      {/* Confetti para celebrações */}
      <Confetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
}
