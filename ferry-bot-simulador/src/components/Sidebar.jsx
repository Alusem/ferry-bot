import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">⚓</div>
          <h2>Ferry Bot</h2>
        </div>
        <p className="sidebar-subtitle">Painel de Gestão</p>
        {user && (
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.75rem', 
            color: '#94a3b8',
            textAlign: 'center'
          }}>
            {user.name}
          </p>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li>
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/viagens" className={`nav-link ${location.pathname === '/viagens' ? 'active' : ''}`}>
              Viagens
            </Link>
          </li>
          <li>
            <Link to="/embarcacoes" className={`nav-link ${location.pathname === '/embarcacoes' ? 'active' : ''}`}>
              Embarcações
            </Link>
          </li>
          <li>
            <Link to="/reservas" className={`nav-link ${location.pathname === '/reservas' ? 'active' : ''}`}>
              Reservas
            </Link>
          </li>
          <li>
            <Link to="/simulacao" className={`nav-link ${location.pathname === '/simulacao' ? 'active' : ''}`}>
              Simulação
            </Link>
          </li>
          <li>
            <Link to="/relatorios" className={`nav-link ${location.pathname === '/relatorios' ? 'active' : ''}`}>
              Relatórios
            </Link>
          </li>
          <li>
            <Link to="/feedback" className={`nav-link ${location.pathname === '/feedback' ? 'active' : ''}`}>
              Feedback
            </Link>
          </li>
        </ul>
      </nav>

      <div style={{ 
        padding: '1rem',
        borderTop: '1px solid #334155',
        marginTop: 'auto'
      }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#ef4444'
            e.target.style.color = 'white'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.color = '#ef4444'
          }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}

export default Sidebar

