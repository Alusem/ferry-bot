import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)

  // Carregar token do localStorage ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Configurar o token no axios
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      })

      if (response.data.success && response.data.data) {
        const { user: userData, token: newToken } = response.data.data
        
        // Salvar no estado
        setUser(userData)
        setToken(newToken)
        
        // Salvar no localStorage
        localStorage.setItem('auth_token', newToken)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        // Configurar o token no axios para todas as requisições futuras
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        
        return { success: true, user: userData }
      } else {
        return { success: false, message: response.data.message || 'Erro ao fazer login' }
      }
    } catch (error) {
      console.error('Erro no login:', error)
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Erro ao fazer login. Verifique suas credenciais.'
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      // Tentar fazer logout na API se houver token
      if (token) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error)
    } finally {
      // Limpar estado e localStorage
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Remover token do axios
      delete api.defaults.headers.common['Authorization']
    }
  }

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    isLoading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

