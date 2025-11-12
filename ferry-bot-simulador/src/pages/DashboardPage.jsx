import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Card from '../components/Card'

function DashboardPage() {
  const [kpis, setKpis] = useState({
    vesselsOperational: 0,
    vesselsTotal: 0,
    tripsScheduled: 0,
    tripsToday: 0
  })
  const [recentTrips, setRecentTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Faz as duas chamadas em paralelo
        const [vesselsResponse, tripsResponse] = await Promise.all([
          api.get('/public/vessels'),
          api.get('/public/trips')
        ])

        const vessels = vesselsResponse.data.data || []
        const trips = tripsResponse.data.data || []

        // Calcula os KPIs
        // Como a API não retorna status diretamente para vessels, consideramos todas como operacionais
        // ou podemos verificar se têm viagens ativas
        const operational = vessels.length // Todas as embarcações estão operacionais por padrão
        
        // Filtra viagens agendadas (status: 'agendada')
        const scheduled = trips.filter(t => t.status === 'agendada').length

        // Viagens de hoje (podemos filtrar por data se necessário, mas por enquanto todas)
        const todayTrips = trips.length

        // Calcula taxa de ocupação média
        let totalOccupancy = 0
        let tripsWithOccupancy = 0
        trips.forEach(trip => {
          if (trip.ocupacao) {
            const [current, max] = trip.ocupacao.split('/').map(Number)
            if (!isNaN(current) && !isNaN(max) && max > 0) {
              totalOccupancy += (current / max) * 100
              tripsWithOccupancy++
            }
          }
        })
        const avgOccupancy = tripsWithOccupancy > 0 
          ? Math.round(totalOccupancy / tripsWithOccupancy) 
          : 0

        setKpis({
          vesselsOperational: operational,
          vesselsTotal: vessels.length,
          tripsScheduled: scheduled,
          tripsToday: todayTrips,
          avgOccupancy: avgOccupancy
        })

        // Pega as 3 viagens mais recentes (ordenadas por departure_time)
        const sortedTrips = [...trips].sort((a, b) => 
          new Date(b.departure_time) - new Date(a.departure_time)
        )
        setRecentTrips(sortedTrips.slice(0, 3))

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatStatus = (status) => {
    const statusMap = {
      'concluida': 'Concluída',
      'cancelada': 'Cancelada',
      'agendada': 'Agendada',
      'em_curso': 'Em Curso'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'concluida':
        return 'status-concluida'
      case 'cancelada':
        return 'status-cancelada'
      case 'agendada':
        return 'status-agendada'
      case 'em_curso':
        return 'status-agendada'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Dashboard</h1>
        <p>A carregar dados do dashboard...</p>
      </>
    )
  }

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="kpi-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '0.875rem', fontWeight: '500' }}>
              Embarcações Operando
            </h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {kpis.vesselsOperational} / {kpis.vesselsTotal}
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '0.875rem', fontWeight: '500' }}>
              Viagens Agendadas
            </h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {kpis.tripsScheduled}
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '0.875rem', fontWeight: '500' }}>
              Total de Viagens (Hoje)
            </h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {kpis.tripsToday}
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '0.875rem', fontWeight: '500' }}>
              Taxa de Ocupação Média
            </h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {kpis.avgOccupancy}%
            </p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>
          Viagens Recentes
        </h3>
        <div className="table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>HORÁRIO</th>
                <th>EMBARCAÇÃO</th>
                <th>TRAJETO</th>
                <th>OCUPAÇÃO</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{formatTime(trip.departure_time)}</td>
                    <td>{trip.vessel?.name || 'N/A'}</td>
                    <td>{trip.trajeto || 'N/A'}</td>
                    <td>{trip.ocupacao || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(trip.status)}`}>
                        {formatStatus(trip.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                    Nenhuma viagem encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export default DashboardPage

