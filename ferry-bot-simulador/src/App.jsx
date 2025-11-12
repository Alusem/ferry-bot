import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import './App.css'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SimulacaoPage from './pages/SimulacaoPage'
import ViagensPage from './pages/ViagensPage'
import EmbarcacoesPage from './pages/EmbarcacoesPage'
import ReservasPage from './pages/ReservasPage'
import RelatoriosPage from './pages/RelatoriosPage'
import FeedbackPage from './pages/FeedbackPage'

// Componente para rotas protegidas
function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <p>A carregar...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/simulacao" element={<SimulacaoPage />} />
          <Route path="/viagens" element={<ViagensPage />} />
          <Route path="/embarcacoes" element={<EmbarcacoesPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

