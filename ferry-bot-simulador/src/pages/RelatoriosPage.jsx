import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Card from '../components/Card'

function RelatoriosPage() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  async function fetchStats() {
    setIsLoading(true)
    try {
      const response = await api.get('/reports/analytics', {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end
        }
      })

      if (response.data && response.data.data) {
        setStats(response.data.data)
      } else {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-PT').format(num)
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(num)
  }

  const calculatePercentage = (part, total) => {
    if (total === 0) return 0
    return ((part / total) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Relatórios e Análises</h1>
        <p>A carregar relatórios...</p>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Relatórios e Análises</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
          <span>até</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {stats && (
        <>
          {/* Cards de Estatísticas Gerais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Card>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total de Viagens</h3>
                  <span style={{ fontSize: '1.5rem' }}>🚢</span>
                </div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {formatNumber(stats.total_trips || 0)}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {stats.completed_trips || 0} concluídas
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total de Reservas</h3>
                  <span style={{ fontSize: '1.5rem' }}>🎫</span>
                </div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {formatNumber(stats.total_bookings || 0)}
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {stats.confirmed_bookings || 0} confirmadas
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Taxa de Ocupação</h3>
                  <span style={{ fontSize: '1.5rem' }}>📊</span>
                </div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                  {calculatePercentage(stats.total_passengers || 0, stats.total_capacity || 0)}%
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {formatNumber(stats.total_passengers || 0)} / {formatNumber(stats.total_capacity || 0)} lugares
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Taxa de Cancelamento</h3>
                  <span style={{ fontSize: '1.5rem' }}>❌</span>
                </div>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
                  {calculatePercentage(stats.cancelled_bookings || 0, stats.total_bookings || 0)}%
                </p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                  {formatNumber(stats.cancelled_bookings || 0)} canceladas
                </p>
              </div>
            </Card>
          </div>

          {/* Relatório de Embarcações */}
          <Card style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
              📈 Desempenho por Embarcação
            </h2>
            {stats.vessels_performance && stats.vessels_performance.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Embarcação</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Viagens</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Ocupação Média</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.vessels_performance.map((vessel, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', color: '#1e293b', fontWeight: '500' }}>{vessel.name}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{vessel.trips_count || 0}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>
                          {calculatePercentage(vessel.total_passengers || 0, vessel.total_capacity || 0)}%
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: vessel.status === 'Operacional' ? '#d1fae5' : '#fef3c7',
                            color: vessel.status === 'Operacional' ? '#065f46' : '#92400e'
                          }}>
                            {vessel.status || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Sem dados disponíveis</p>
            )}
          </Card>

          {/* Relatório de Viagens por Status */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Card>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>
                📅 Viagens por Status
              </h3>
              {stats.trips_by_status && Object.keys(stats.trips_by_status).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {Object.entries(stats.trips_by_status).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontSize: '0.875rem' }}>{status}</span>
                      <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sem dados disponíveis</p>
              )}
            </Card>

            <Card>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>
                ⏰ Horários de Maior Demanda
              </h3>
              {stats.peak_hours && stats.peak_hours.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.peak_hours.slice(0, 5).map((hour, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontSize: '0.875rem' }}>{hour.hour}:00</span>
                      <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>{formatNumber(hour.bookings || 0)} reservas</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sem dados disponíveis</p>
              )}
            </Card>

            <Card>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1.125rem', fontWeight: '600' }}>
                🗺️ Trajetos Mais Populares
              </h3>
              {stats.popular_routes && stats.popular_routes.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {stats.popular_routes.map((route, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#475569', fontSize: '0.875rem' }}>{route.trajeto}</span>
                      <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '1rem' }}>{formatNumber(route.count || 0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sem dados disponíveis</p>
              )}
            </Card>
          </div>
        </>
      )}
    </>
  )
}

export default RelatoriosPage
