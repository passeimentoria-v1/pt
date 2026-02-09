import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const AVATARS = [
  '😀', '😎', '🤓', '🥳', '🤩', '😇',
  '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍🏫', '👩‍🏫',
  '🦁', '🐯', '🦊', '🐼', '🐨', '🐸',
  '🚀', '⭐', '🎯', '🏆', '💎', '🔥'
];

export default function AvatarSelector({ onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        avatar: selected
      });
      onSuccess(selected);
    } catch (error) {
      alert('Erro ao salvar avatar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Escolha seu Avatar</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-6 gap-3 mb-6">
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                onClick={() => setSelected(avatar)}
                className={`text-4xl p-3 rounded-xl border-2 transition ${
                  selected === avatar
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium dark:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selected}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Salvando...' : 'Salvar Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
