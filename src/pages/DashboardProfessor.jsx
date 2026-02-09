import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Trophy, Plus, 
  LogOut, BarChart3, FileText, Upload, School
} from 'lucide-react';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import UploadExcel from '../components/UploadExcel';

export default function DashboardProfessor() {
  const { userData, currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showUploadExcel, setShowUploadExcel] = useState(false);
  const [stats, setStats] = useState({ totalStudents: 0, totalQuestions: 0, avgXP: 0 });

  useEffect(() => {
    if (!currentUser || userData?.role !== 'teacher') {
      navigate('/');
    } else {
      loadData();
    }
  }, [currentUser, userData, navigate]);

  const loadData = async () => {
    // Carregar alunos
    const studentsQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const studentsSnapshot = await getDocs(studentsQuery);
    const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(studentsData);

    // Carregar questões
    const questionsSnapshot = await getDocs(collection(db, 'questions'));
    const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setQuestions(questionsData);

    // Calcular estatísticas
    const totalXP = studentsData.reduce((sum, s) => sum + (s.xp || 0), 0);
    setStats({
      totalStudents: studentsData.length,
      totalQuestions: questionsData.length,
      avgXP: studentsData.length > 0 ? Math.round(totalXP / studentsData.length) : 0
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Painel do Professor</h1>
              <p className="text-primary-100">{userData?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total de Alunos</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Questões Cadastradas</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">XP Médio</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgXP}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowAddQuestion(true)}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-left"
          >
            <Plus className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2">Adicionar Questão</h3>
            <p className="text-primary-100">Crie novas questões manualmente</p>
          </button>

          <button
            onClick={() => setShowUploadExcel(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-left"
          >
            <Upload className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2">Upload Excel</h3>
            <p className="text-green-100">Envie várias questões de uma vez</p>
          </button>

          <button
            onClick={() => navigate('/professor/turmas')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-left"
          >
            <School className="w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold mb-2">Gerenciar Turmas</h3>
            <p className="text-purple-100">Organize seus alunos em turmas</p>
          </button>
        </div>

        {/* Lista de Alunos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Alunos Cadastrados</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Ver todos →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Nível</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">XP</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Sequência</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{student.name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                        {student.level || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-gray-900">
                      {student.xp || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 text-orange-600 font-medium">
                        <span>{student.streak || 0}</span>
                        <span>🔥</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {students.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum aluno cadastrado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Adicionar Questão */}
      {showAddQuestion && (
        <AddQuestionModal
          onClose={() => setShowAddQuestion(false)}
          onSuccess={() => {
            setShowAddQuestion(false);
            loadData();
          }}
        />
      )}

      {/* Modal Upload Excel */}
      {showUploadExcel && (
        <UploadExcel
          onClose={() => setShowUploadExcel(false)}
          onSuccess={() => {
            setShowUploadExcel(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function AddQuestionModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category: 'ortografia',
    question: '',
    alternatives: ['', '', '', ''],
    correctAnswer: 0,
    xpReward: 50,
    explanation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'questions'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      onSuccess();
    } catch (error) {
      alert('Erro ao adicionar questão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Nova Questão</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="ortografia">Ortografia</option>
              <option value="gramatica">Gramática</option>
              <option value="interpretacao">Interpretação de Texto</option>
              <option value="redacao">Redação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Enunciado da Questão</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg h-24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Alternativas</label>
            {formData.alternatives.map((alt, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="radio"
                  checked={formData.correctAnswer === index}
                  onChange={() => setFormData({ ...formData, correctAnswer: index })}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => {
                    const newAlts = [...formData.alternatives];
                    newAlts[index] = e.target.value;
                    setFormData({ ...formData, alternatives: newAlts });
                  }}
                  placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                  className="flex-1 px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">XP de Recompensa</label>
            <input
              type="number"
              value={formData.xpReward}
              onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg"
              min="10"
              max="200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Explicação (opcional)</label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg h-20"
              placeholder="Explique por que a resposta está correta..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Adicionar Questão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
