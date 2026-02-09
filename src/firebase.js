import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANTE: Substitua com suas credenciais do Firebase
// Acesse: https://console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyCkQxkmUtxQ-WJr53BxiKHbI70GLeqDGs0",
  authDomain: "portugues-gamificado.firebaseapp.com",
  projectId: "portugues-gamificado",
  storageBucket: "portugues-gamificado.firebasestorage.app",
  messagingSenderId: "308936749016",
  appId: "1:308936749016:web:55578f51adaf6405bbccad"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
