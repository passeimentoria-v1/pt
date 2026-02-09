import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, TrendingUp, Target, Award, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Estatisticas() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      loadStatistics();
    }
  }, [currentUser, userData]);

  const loadStatistics = async () => {
    try {
      // Buscar progresso do aluno
      const q = query(
        collection(db, 'progress'),
        where('userId', '==', currentUser.uid),
        orderBy('completedAt', 'asc')
      );
      const snapshot = await getDocs(q);
      
      // Processar dados para gráfico de linha (evolução de XP)
      const progress = [];
      let cumulativeXP = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        cumulativeXP += data.score || 0;
        progress.push({
          date: new Date(data.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          xp: cumulativeXP,
          questoes: data.totalQuestions || 0
        });
      });
      setProgressData(progress);

      // Processar dados por categoria
      const categoryStats = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const cat = data.category || 'Outros';
        if (!categoryStats[cat]) {
          categoryStats[cat] = { total: 0, correct: 0 };
        }
        categoryStats[cat].total += data.totalQuestions || 0;
        categoryStats[cat].correct += Math.round((data.score / 50) || 0); // Assumindo 50 XP por questão
      });

      const categories = Object.keys(categoryStats).map(cat => ({
        name: cat,
        total: categoryStats[cat].total,
        acertos: categoryStats[cat].correct,
        taxa: categoryStats[cat].total > 0 
          ? Math.round((categoryStats[cat].correct / categoryStats[cat].total) * 100) 
          : 0
      }));
      setCategoryData(categories);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/aluno')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-10 h-10" />
            <div>
              <h1 className="text-3xl font-bold">Minhas Estatísticas</h1>
              <p className="text-blue-100">Acompanhe sua evolução e desempenho</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">XP Total</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{userData?.xp || 0}</p>
            <p className="text-sm text-green-600 mt-1">Nível {userData?.level || 1}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Questões Respondidas</span>
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {progressData.reduce((sum, p) => sum + (p.questoes || 0), 0)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Sequência Atual</span>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{userData?.streak || 0}</p>
            <p className="text-sm text-gray-600 mt-1">dias</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Conquistas</span>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{userData?.badges?.length || 0}</p>
          </div>
        </div>

        {/* Gráfico de Evolução de XP */}
        {progressData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Evolução de XP</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  name="XP Acumulado"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráficos por Categoria */}
        {categoryData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Taxa de Acerto por Categoria */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Taxa de Acerto por Categoria</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taxa" fill="#22c55e" name="Taxa de Acerto (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribuição de Questões por Categoria */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Questões por Categoria</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.total}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {progressData.length === 0 && categoryData.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sem dados ainda</h3>
            <p className="text-gray-600 mb-6">
              Complete alguns exercícios para ver suas estatísticas aqui
            </p>
            <button
              onClick={() => navigate('/aluno')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              Começar a Estudar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
