import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  collection, addDoc, getDocs, query, where, updateDoc, doc, arrayUnion, getDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Plus, Copy, CheckCircle, BarChart3, Trophy, ArrowLeft } from 'lucide-react';

export default function GerenciarTurmas() {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [turmas, setTurmas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'teacher') {
      navigate('/');
    } else {
      loadTurmas();
    }
  }, [currentUser, userData]);

  const loadTurmas = async () => {
    const q = query(collection(db, 'turmas'), where('teacherId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    const turmasData = await Promise.all(
      snapshot.docs.map(async (turmaDoc) => {
        const turmaData = turmaDoc.data();
        
        // Buscar alunos da turma
        const alunosPromises = turmaData.students.map(async (studentId) => {
          const studentDoc = await getDoc(doc(db, 'users', studentId));
          return studentDoc.exists() ? { id: studentId, ...studentDoc.data() } : null;
        });
        
        const alunos = (await Promise.all(alunosPromises)).filter(a => a !== null);
        
        return {
          id: turmaDoc.id,
          ...turmaData,
          alunosDetalhes: alunos
        };
      })
    );

    setTurmas(turmasData);
    setLoading(false);
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/professor')}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Turmas</h1>
              <p className="text-purple-100">Organize seus alunos em turmas</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Turma</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando turmas...</p>
          </div>
        ) : turmas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma turma criada</h3>
            <p className="text-gray-600 mb-6">Crie sua primeira turma para organizar seus alunos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Primeira Turma</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma) => (
              <TurmaCard key={turma.id} turma={turma} onUpdate={loadTurmas} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateTurmaModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTurmas();
          }}
        />
      )}
    </div>
  );
}

function TurmaCard({ turma, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(turma.accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const avgXP = turma.alunosDetalhes.length > 0
    ? Math.round(turma.alunosDetalhes.reduce((sum, a) => sum + (a.xp || 0), 0) / turma.alunosDetalhes.length)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{turma.name}</h3>
          <span className="text-2xl">{turma.emoji || '📚'}</span>
        </div>

        <p className="text-sm text-gray-600 mb-4">{turma.description}</p>

        {/* Código de Acesso */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <p className="text-xs text-purple-600 font-medium mb-1">Código de Acesso</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-900 tracking-wider">
              {turma.accessCode}
            </span>
            <button
              onClick={copyCode}
              className="p-2 hover:bg-purple-100 rounded-lg transition"
              title="Copiar código"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-purple-600" />
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{turma.alunosDetalhes.length}</p>
            <p className="text-xs text-gray-600">Alunos</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{avgXP}</p>
            <p className="text-xs text-gray-600">XP Médio</p>
          </div>
        </div>

        {/* Alunos */}
        {turma.alunosDetalhes.length > 0 && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full text-left text-sm font-medium text-purple-600 hover:text-purple-700 mb-2"
            >
              {expanded ? '▼' : '▶'} Ver alunos
            </button>
            
            {expanded && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {turma.alunosDetalhes
                  .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                  .map((aluno, index) => (
                    <div key={aluno.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                        <span className="text-sm font-medium">{aluno.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-bold text-purple-600">{aluno.xp || 0}</span>
                        <span className="text-xs text-gray-500">XP</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <button className="w-full text-sm font-medium text-purple-600 hover:text-purple-700">
          Ver Estatísticas Detalhadas →
        </button>
      </div>
    </div>
  );
}

function CreateTurmaModal({ onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '📚',
    accessCode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(prev => ({ ...prev, accessCode: generateCode() }));
  }, []);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'turmas'), {
        ...formData,
        teacherId: currentUser.uid,
        students: [],
        createdAt: new Date().toISOString()
      });
      onSuccess();
    } catch (error) {
      alert('Erro ao criar turma: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const emojis = ['📚', '🎓', '✏️', '📖', '🏆', '⭐', '🚀', '💡', '🎯', '📝'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Nova Turma</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Turma</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: 3º Ano A, Turma Avançada..."
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Breve descrição da turma..."
              className="w-full px-4 py-2 border rounded-lg h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Emoji da Turma</label>
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={`text-3xl p-3 rounded-lg border-2 transition ${
                    formData.emoji === emoji
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-900 font-medium mb-2">Código de Acesso Gerado:</p>
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <span className="text-2xl font-bold text-purple-900 tracking-wider">
                {formData.accessCode}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accessCode: generateCode() })}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Gerar Novo
              </button>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Os alunos usarão este código para entrar na turma
            </p>
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
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Turma'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
