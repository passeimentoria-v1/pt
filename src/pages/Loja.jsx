import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, ShoppingBag, Coins, Sparkles, CheckCircle } from 'lucide-react';

export default function Loja() {
  const { currentUser, userData, addXP } = useAuth();
  const navigate = useNavigate();
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!currentUser || userData?.role !== 'student') {
      navigate('/');
    } else {
      setPurchasedItems(userData.purchasedItems || []);
    }
  }, [currentUser, userData]);

  const storeItems = [
    // AVATARES PREMIUM
    {
      id: 'avatar_wizard',
      name: 'Avatar Mago',
      description: 'Avatar exclusivo de mago para seu perfil',
      icon: '🧙‍♂️',
      price: 500,
      category: 'avatar',
      type: 'avatar'
    },
    {
      id: 'avatar_ninja',
      name: 'Avatar Ninja',
      description: 'Avatar exclusivo de ninja para seu perfil',
      icon: '🥷',
      price: 500,
      category: 'avatar',
      type: 'avatar'
    },
    {
      id: 'avatar_robot',
      name: 'Avatar Robô',
      description: 'Avatar exclusivo de robô para seu perfil',
      icon: '🤖',
      price: 500,
      category: 'avatar',
      type: 'avatar'
    },
    {
      id: 'avatar_alien',
      name: 'Avatar Alien',
      description: 'Avatar exclusivo alien para seu perfil',
      icon: '👽',
      price: 750,
      category: 'avatar',
      type: 'avatar'
    },

    // TÍTULOS
    {
      id: 'titulo_estudioso',
      name: 'O Estudioso',
      description: 'Título que aparece ao lado do seu nome',
      icon: '📚',
      price: 300,
      category: 'titulo',
      type: 'title'
    },
    {
      id: 'titulo_guerreiro',
      name: 'O Guerreiro',
      description: 'Título que aparece ao lado do seu nome',
      icon: '⚔️',
      price: 400,
      category: 'titulo',
      type: 'title'
    },
    {
      id: 'titulo_mestre',
      name: 'Mestre do Português',
      description: 'Título que aparece ao lado do seu nome',
      icon: '👑',
      price: 1000,
      category: 'titulo',
      type: 'title'
    },

    // POWER-UPS
    {
      id: 'powerup_xp2x',
      name: 'XP em Dobro',
      description: 'Ganhe XP em dobro por 24 horas',
      icon: '⚡',
      price: 200,
      category: 'powerup',
      type: 'powerup',
      duration: '24h'
    },
    {
      id: 'powerup_shield',
      name: 'Escudo de Streak',
      description: 'Protege seu streak por 1 dia caso você esqueça',
      icon: '🛡️',
      price: 150,
      category: 'powerup',
      type: 'powerup',
      duration: 'único'
    },
    {
      id: 'powerup_hint',
      name: 'Dica Mágica',
      description: 'Elimine 2 alternativas erradas (3 usos)',
      icon: '💡',
      price: 100,
      category: 'powerup',
      type: 'powerup',
      duration: '3 usos'
    },

    // TEMAS
    {
      id: 'tema_oceano',
      name: 'Tema Oceano',
      description: 'Tema azul oceano para seu dashboard',
      icon: '🌊',
      price: 600,
      category: 'tema',
      type: 'theme'
    },
    {
      id: 'tema_floresta',
      name: 'Tema Floresta',
      description: 'Tema verde floresta para seu dashboard',
      icon: '🌲',
      price: 600,
      category: 'tema',
      type: 'theme'
    },
    {
      id: 'tema_lava',
      name: 'Tema Lava',
      description: 'Tema vermelho lava para seu dashboard',
      icon: '🌋',
      price: 800,
      category: 'tema',
      type: 'theme'
    },

    // ESPECIAIS
    {
      id: 'special_name_color',
      name: 'Nome Colorido',
      description: 'Seu nome aparece em dourado no ranking',
      icon: '✨',
      price: 1500,
      category: 'especial',
      type: 'special'
    },
    {
      id: 'special_confetti',
      name: 'Confete Infinito',
      description: 'Confete especial ao completar qualquer questão',
      icon: '🎉',
      price: 1200,
      category: 'especial',
      type: 'special'
    }
  ];

  const handlePurchase = (item) => {
    setSelectedItem(item);
    setShowConfirmModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem) return;

    // Verificar se tem XP suficiente
    if ((userData?.xp || 0) < selectedItem.price) {
      alert('XP insuficiente! Continue estudando para ganhar mais XP.');
      setShowConfirmModal(false);
      return;
    }

    // Verificar se já comprou
    if (purchasedItems.includes(selectedItem.id)) {
      alert('Você já possui este item!');
      setShowConfirmModal(false);
      return;
    }

    try {
      // Deduzir XP (usando número negativo)
      await addXP(-selectedItem.price);

      // Adicionar item comprado
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        purchasedItems: arrayUnion(selectedItem.id)
      });

      setPurchasedItems([...purchasedItems, selectedItem.id]);
      alert(`🎉 Você comprou: ${selectedItem.name}!`);
      setShowConfirmModal(false);
      setSelectedItem(null);
    } catch (error) {
      alert('Erro ao comprar item: ' + error.message);
    }
  };

  const isOwned = (itemId) => purchasedItems.includes(itemId);

  const groupByCategory = () => {
    const groups = {
      'avatar': { name: 'Avatares Premium', items: [], icon: '😎' },
      'titulo': { name: 'Títulos Especiais', items: [], icon: '👑' },
      'powerup': { name: 'Power-Ups', items: [], icon: '⚡' },
      'tema': { name: 'Temas Personalizados', items: [], icon: '🎨' },
      'especial': { name: 'Itens Especiais', items: [], icon: '✨' }
    };

    storeItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].items.push(item);
      }
    });

    return groups;
  };

  const itemGroups = groupByCategory();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
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
              <ShoppingBag className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Loja de Recompensas</h1>
                <p className="text-yellow-100">Troque seu XP por itens exclusivos!</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
              <div className="flex items-center space-x-2 mb-1">
                <Coins className="w-6 h-6" />
                <span className="text-3xl font-bold">{userData?.xp || 0}</span>
              </div>
              <p className="text-sm text-yellow-100">XP Disponível</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <span>Como Funciona</span>
          </h2>
          <ul className="space-y-2 text-blue-50">
            <li>🪙 Ganhe XP completando exercícios e desafios</li>
            <li>🛍️ Compre itens exclusivos na loja</li>
            <li>✨ Personalize sua experiência de aprendizado</li>
            <li>🎁 Novos itens adicionados regularmente!</li>
          </ul>
        </div>

        {Object.entries(itemGroups).map(([category, group]) => {
          if (group.items.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <span className="text-3xl">{group.icon}</span>
                <span>{group.name}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.items.map((item) => {
                  const owned = isOwned(item.id);
                  const canAfford = (userData?.xp || 0) >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 overflow-hidden transition ${
                        owned ? 'border-green-500' : canAfford ? 'border-yellow-500' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="text-5xl">{item.icon}</div>
                          {owned && (
                            <CheckCircle className="w-8 h-8 text-green-600" />
                          )}
                        </div>

                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {item.description}
                        </p>

                        {item.duration && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 mb-4">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                              ⏱️ Duração: {item.duration}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                          <div className="flex items-center space-x-2">
                            <Coins className="w-5 h-5 text-yellow-600" />
                            <span className="font-bold text-xl text-yellow-600">{item.price}</span>
                            <span className="text-sm text-gray-500">XP</span>
                          </div>

                          {owned ? (
                            <span className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-medium text-sm">
                              ✓ Comprado
                            </span>
                          ) : canAfford ? (
                            <button
                              onClick={() => handlePurchase(item)}
                              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition"
                            >
                              Comprar
                            </button>
                          ) : (
                            <span className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg font-medium text-sm">
                              XP Insuficiente
                            </span>
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

      {/* Modal de Confirmação */}
      {showConfirmModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmar Compra
            </h3>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-6xl">{selectedItem.icon}</div>
              <div>
                <p className="font-bold text-lg dark:text-white">{selectedItem.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedItem.description}</p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Preço:</span>
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-xl text-yellow-600">{selectedItem.price} XP</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                <span className="text-gray-700 dark:text-gray-300">Saldo Restante:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {(userData?.xp || 0) - selectedItem.price} XP
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedItem(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
