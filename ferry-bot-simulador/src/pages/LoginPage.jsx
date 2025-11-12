import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)
      
      if (result.success) {
        // Redirecionar para o dashboard após login bem-sucedido
        navigate('/dashboard')
      } else {
        setError(result.message || 'Erro ao fazer login')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '1rem'
    }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <h2 style={{
          margin: '0 0 1.5rem 0',
          color: '#1e293b',
          fontSize: '1.5rem',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          Ferry Bot - Login
        </h2>

        {error && (
          <div style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="seu@email.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          Use suas credenciais para aceder ao painel
        </p>
      </Card>
    </div>
  )
}

export default LoginPage

