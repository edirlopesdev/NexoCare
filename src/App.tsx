import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginForm from './auth/LoginForm';
import { ToastProvider } from './components/ui/toast';
import { AgendamentosPage } from './pages/Agendamentos';
import { PacientesPage } from './pages/Pacientes';
import { PerfisPage } from './pages/Perfis';
import { PlanosPage } from './pages/Planos';
import { ProdutosPage } from './pages/Produtos';
import { Toaster } from "./components/ui/toaster"
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componente separado para usar o hook useAuth
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="flex">
      {user && <Sidebar />}
      <main className="flex-1">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/agendamentos"
            element={user ? <AgendamentosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/pacientes"
            element={user ? <PacientesPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/perfis"
            element={user ? <PerfisPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/planos"
            element={user ? <PlanosPage /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/produtos"
            element={user ? <ProdutosPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
