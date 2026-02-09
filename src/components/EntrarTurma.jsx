import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function EntrarTurma({ onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [turmaInfo, setTurmaInfo] = useState(null);

  const handleJoinTurma = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const codeUpper = code.toUpperCase().trim();
      
      // Buscar turma pelo código
      const q = query(collection(db, 'turmas'), where('accessCode', '==', codeUpper));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('Código inválido. Verifique e tente novamente.');
        setLoading(false);
        return;
      }

      const turmaDoc = snapshot.docs[0];
      const turmaData = turmaDoc.data();

      // Verificar se já está na turma
      if (turmaData.students.includes(currentUser.uid)) {
        setError('Você já está nesta turma!');
        setLoading(false);
        return;
      }

      // Adicionar aluno à turma
      await updateDoc(doc(db, 'turmas', turmaDoc.id), {
        students: arrayUnion(currentUser.uid)
      });

      setTurmaInfo(turmaData);
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('Erro ao entrar na turma: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Entrar em uma Turma</h2>
              <p className="text-gray-600 text-sm mt-1">Digite o código fornecido pelo professor</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sucesso!</h3>
            <p className="text-gray-600 mb-4">
              Você entrou na turma <strong>{turmaInfo?.name}</strong>
            </p>
            <div className="text-6xl mb-4">{turmaInfo?.emoji || '📚'}</div>
            <p className="text-sm text-gray-500">
              Agora você pode competir com seus colegas!
            </p>
          </div>
        ) : (
          <form onSubmit={handleJoinTurma} className="p-6 space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 flex items-start space-x-3">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-purple-900 font-medium">Como funciona?</p>
                <p className="text-sm text-purple-700 mt-1">
                  Peça o código de acesso ao seu professor e digite abaixo para entrar na turma.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Código da Turma</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-bold tracking-wider uppercase focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Digite o código de 6 caracteres
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex space-x-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Entrando...' : 'Entrar na Turma'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
