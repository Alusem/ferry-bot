import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Card from '../components/Card'

function FeedbackPage() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchReports() {
      try {
        // O token de admin será adicionado automaticamente pelo axios
        const response = await api.get('/reports')

        if (response.data && response.data.data) {
          setReports(response.data.data)
        } else {
          setReports(response.data)
        }
      } catch (error) {
        console.error("Erro ao buscar feedback:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} às ${hours}:${minutes}`
  }

  const formatStatus = (status) => {
    const statusMap = {
      'Pendente': 'Pendente',
      'Resolvido': 'Resolvido',
      'Em Análise': 'Em Análise'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolvido':
        return 'status-concluida'
      case 'Pendente':
        return 'status-agendada'
      case 'Em Análise':
        return 'status-manutencao'
      default:
        return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolvido':
        return { bg: '#d1fae5', text: '#065f46' }
      case 'Pendente':
        return { bg: '#fef3c7', text: '#92400e' }
      case 'Em Análise':
        return { bg: '#dbeafe', text: '#1e40af' }
      default:
        return { bg: '#e2e8f0', text: '#475569' }
    }
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Feedback dos Usuários</h1>
        <p>A carregar feedback...</p>
      </>
    )
  }

  return (
    <>
      <h1 className="page-title">Feedback dos Usuários</h1>
      
      <div className="reports-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.length > 0 ? (
          reports.map(report => {
            const statusColor = getStatusColor(report.status)
            return (
              <Card key={report.id} className="report-card">
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>
                    {report.title}
                  </h3>
                  <span 
                    className={`status-badge ${getStatusClass(report.status)}`}
                    style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    {formatStatus(report.status)}
                  </span>
                </div>
                <p style={{ 
                  margin: '0 0 0.75rem 0', 
                  color: '#475569', 
                  lineHeight: '1.6',
                  fontSize: '0.9375rem'
                }}>
                  {report.content}
                </p>
                <small style={{ 
                  color: '#94a3b8', 
                  fontSize: '0.875rem'
                }}>
                  Recebido em: {formatTime(report.created_at)}
                </small>
              </Card>
            )
          })
        ) : (
          <div style={{ 
            padding: '2rem', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            color: '#64748b',
            fontSize: '1rem',
            textAlign: 'center'
          }}>
            <p>Nenhum feedback encontrado.</p>
          </div>
        )}
      </div>
    </>
  )
}

export default FeedbackPage

