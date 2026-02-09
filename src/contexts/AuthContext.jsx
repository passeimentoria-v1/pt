import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name, role = 'student') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const newUserData = {
      name,
      email,
      role,
      xp: 0,
      level: 1,
      streak: 0,
      lastStudyDate: null,
      badges: [],
      createdAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), newUserData);
    
    // Seta userData imediatamente
    setUserData(newUserData);

    return userCredential;
  };

  const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Carregar userData imediatamente após login
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
    return userCredential;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserData(null);
  };

  const reloadUserData = async () => {
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        console.log('✅ UserData recarregado:', userDoc.data());
      }
    }
  };

  const addXP = async (amount) => {
    if (!currentUser) return;
    
    const userRef = doc(db, 'users', currentUser.uid);
    const newXP = (userData?.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 100) + 1;

    await updateDoc(userRef, {
      xp: increment(amount),
      level: newLevel
    });

    setUserData(prev => ({
      ...prev,
      xp: newXP,
      level: newLevel
    }));

    // Verificar e desbloquear conquistas
    checkAndUnlockBadges(newXP, newLevel);
  };

  const checkAndUnlockBadges = async (currentXP, currentLevel) => {
    if (!currentUser || !userData) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userBadges = userData.badges || [];
    const newBadges = [];

    // Lista de todas as conquistas possíveis
    const allBadges = [
      // Bronze
      { id: 'first_steps', type: 'exercises_completed', count: 1 },
      { id: 'beginner', type: 'total_xp', count: 100 },
      { id: 'daily_warrior', type: 'daily_challenges', count: 3 },
      // Prata
      { id: 'knowledge_seeker', type: 'exercises_completed', count: 25 },
      { id: 'fire_streak', type: 'streak_days', count: 7 },
      { id: 'level_5', type: 'level', count: 5 },
      // Ouro
      { id: 'master_learner', type: 'exercises_completed', count: 100 },
      { id: 'marathon', type: 'streak_days', count: 30 },
      { id: 'top_10', type: 'ranking_position', count: 10 },
      { id: 'level_10', type: 'level', count: 10 },
      // Diamante
      { id: 'legend', type: 'exercises_completed', count: 500 },
      { id: 'champion', type: 'ranking_position', count: 1 },
      { id: 'eternal', type: 'streak_days', count: 100 },
      { id: 'level_25', type: 'level', count: 25 },
      // Especiais
      { id: 'battle_master', type: 'battles_won', count: 10 },
      { id: 'perfect_week', type: 'weekly_missions_completed', count: 5 }
    ];

    for (const badge of allBadges) {
      // Se já tem a badge, pular
      if (userBadges.includes(badge.id)) continue;

      let shouldUnlock = false;

      switch (badge.type) {
        case 'total_xp':
          shouldUnlock = currentXP >= badge.count;
          break;
        case 'level':
          shouldUnlock = currentLevel >= badge.count;
          break;
        case 'streak_days':
          shouldUnlock = (userData.streak || 0) >= badge.count;
          break;
        case 'exercises_completed':
          shouldUnlock = (userData.exercisesCompleted || 0) >= badge.count;
          break;
        case 'daily_challenges':
          shouldUnlock = (userData.dailyChallengesCompleted || 0) >= badge.count;
          break;
        case 'battles_won':
          shouldUnlock = (userData.battlesWon || 0) >= badge.count;
          break;
        case 'ranking_position':
          shouldUnlock = (userData.rankingPosition || 999) <= badge.count;
          break;
        case 'weekly_missions_completed':
          shouldUnlock = (userData.weeklyMissionsCompleted || 0) >= badge.count;
          break;
      }

      if (shouldUnlock) {
        newBadges.push(badge.id);
      }
    }

    // Se tem novas badges, atualizar Firestore
    if (newBadges.length > 0) {
      await updateDoc(userRef, {
        badges: arrayUnion(...newBadges)
      });

      setUserData(prev => ({
        ...prev,
        badges: [...userBadges, ...newBadges]
      }));

      // Mostrar notificação
      if (newBadges.length === 1) {
        alert('🏆 Conquista Desbloqueada! Confira na aba Conquistas.');
      } else {
        alert(`🏆 ${newBadges.length} Conquistas Desbloqueadas! Confira na aba Conquistas.`);
      }
    }
  };

  const value = {
    currentUser,
    userData,
    signUp,
    signIn,
    signOut,
    addXP,
    reloadUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
