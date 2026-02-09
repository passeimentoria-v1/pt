import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import DashboardAluno from './pages/DashboardAluno';
import DashboardProfessor from './pages/DashboardProfessor';
import Exercicios from './pages/Exercicios';
import DesafioDiario from './pages/DesafioDiario';
import GerenciarTurmas from './pages/GerenciarTurmas';
import ModoBatalha from './pages/ModoBatalha';
import Estatisticas from './pages/Estatisticas';
import MissoesSemanais from './pages/MissoesSemanais';
import RevisaoInteligente from './pages/RevisaoInteligente';
import Conquistas from './pages/Conquistas';
import Loja from './pages/Loja';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/aluno" element={<DashboardAluno />} />
            <Route path="/professor" element={<DashboardProfessor />} />
            <Route path="/exercicios" element={<Exercicios />} />
            <Route path="/desafio-diario" element={<DesafioDiario />} />
            <Route path="/professor/turmas" element={<GerenciarTurmas />} />
            <Route path="/modo-batalha" element={<ModoBatalha />} />
            <Route path="/estatisticas" element={<Estatisticas />} />
            <Route path="/missoes" element={<MissoesSemanais />} />
            <Route path="/revisao" element={<RevisaoInteligente />} />
            <Route path="/conquistas" element={<Conquistas />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
