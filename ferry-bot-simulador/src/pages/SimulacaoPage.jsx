import { useState, useEffect } from 'react'
import { runSimulation } from '../simulationEngine'
import SimulationResults from '../components/SimulationResults'
import Card from '../components/Card'
import api from '../services/api'

function SimulacaoPage() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState('base')
  const [simulationDate, setSimulationDate] = useState(new Date().toISOString().split('T')[0])
  const [systemData, setSystemData] = useState(null)
  const [warnings, setWarnings] = useState([])
  
  // Estado para armazenar resultados de cada cenário
  const [scenarioResults, setScenarioResults] = useState({
    base: null,
    maintenance: null,
    reservations: null
  })

  useEffect(() => {
    fetchSystemData()
  }, [simulationDate])

  async function fetchSystemData() {
    setIsLoadingData(true)
    try {
      const response = await api.get('/simulation/data', {
        params: {
          date: simulationDate
        }
      })

      if (response.data && response.data.data) {
        setSystemData(response.data.data)
        setWarnings(response.data.data.warnings || [])
      }
    } catch (error) {
      console.error("Erro ao buscar dados do sistema:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleRunSimulation = () => {
    if (!systemData) {
      alert('Aguardando dados do sistema...')
      return
    }

    setIsLoading(true)
    
    // Usar dados reais do sistema
    const operationalVessels = systemData.vessels.operational
    const vesselsInMaintenance = systemData.vessels.in_maintenance
    const avgCapacity = systemData.capacity.average
    const scheduledTrips = systemData.trips.scheduled_count
    const totalReservations = systemData.bookings.total_confirmed
    const operationHours = systemData.operation.total_hours
    const operationStart = systemData.operation.start_hour

    // Calcular chegadas estimadas baseado em reservas e histórico
    // Se há reservas, estimamos que 60% são reservas e 40% são walk-ins
    const estimatedWalkIns = systemData.bookings.estimated_walk_ins || (scheduledTrips * 10)
    const avgArrivalsPerDay = totalReservations + estimatedWalkIns

    // Parâmetros base usando dados reais
    let params = {
      numFerries: operationalVessels,
      ferryCapacity: avgCapacity,
      avgArrivalsPerDay: avgArrivalsPerDay || 1200, // Fallback se não houver dados
      operationHours: operationHours || 16,
      operationStart: operationStart || 6,
      useReservations: false,
      scheduledTrips: systemData.trips.list || [],
      bookingsByHour: systemData.bookings.by_hour || {},
      peakHours: [
        { start: (7 - operationStart) * 60, end: (9 - operationStart) * 60 },   // 7h-9h
        { start: (17 - operationStart) * 60, end: (19 - operationStart) * 60 }   // 17h-19h
      ]
    }

    // Ajustar parâmetros baseado no cenário selecionado
    switch (selectedScenario) {
      case 'maintenance':
        // Usar número real de embarcações em manutenção
        params.numFerries = Math.max(1, operationalVessels - 1) // Pelo menos 1 balsa
        break
      case 'reservations':
        params.useReservations = true // Usar reservas reais
        break
      case 'base':
      default:
        // Usa os valores reais do sistema
        break
    }

    // Executar simulação (síncrona)
    const simulationData = runSimulation(params)
    
    // Salvar resultados do cenário atual
    setResults(simulationData)
    
    // Atualizar resultados do cenário específico na tabela comparativa
    setScenarioResults(prev => ({
      ...prev,
      [selectedScenario]: simulationData
    }))
    
    setIsLoading(false)
  }

  if (isLoadingData) {
    return (
      <>
        <h1 className="page-title">Simulação de Cenários Operacionais</h1>
        <p>A carregar dados do sistema...</p>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Simulação de Cenários Operacionais</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Data da Simulação:</label>
          <input
            type="date"
            value={simulationDate}
            onChange={(e) => setSimulationDate(e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>
      </div>

      {/* Avisos do Sistema */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {warnings.map((warning, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                marginBottom: '0.5rem',
                borderRadius: '0.375rem',
                backgroundColor: warning.severity === 'error' ? '#fee2e2' : 
                                 warning.severity === 'warning' ? '#fef3c7' : '#dbeafe',
                border: `1px solid ${warning.severity === 'error' ? '#fecaca' : 
                                       warning.severity === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                color: warning.severity === 'error' ? '#991b1b' : 
                       warning.severity === 'warning' ? '#92400e' : '#1e40af'
              }}
            >
              <strong>{warning.severity === 'error' ? '⚠️ Erro: ' : 
                       warning.severity === 'warning' ? '⚠️ Aviso: ' : 'ℹ️ Info: '}</strong>
              {warning.message}
            </div>
          ))}
        </div>
      )}
      
      <div className="dashboard-grid">
        {/* Card 1: Seleção de Cenários */}
        <Card title="Selecione e Execute um Cenário">
          <div className="scenarios-container">
            <div 
              className={`scenario-button ${selectedScenario === 'base' ? 'active' : ''}`}
              onClick={() => setSelectedScenario('base')}
            >
              Cenário Base (Operação Normal)
              <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.8 }}>
                Usa dados reais do sistema
              </small>
            </div>
            <div 
              className={`scenario-button ${selectedScenario === 'maintenance' ? 'active' : ''}`}
              onClick={() => setSelectedScenario('maintenance')}
            >
              Cenário de Manutenção
              <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.8 }}>
                Simula com {systemData ? Math.max(1, systemData.vessels.operational - 1) : 'menos'} embarcação(ões)
              </small>
            </div>
            <div 
              className={`scenario-button ${selectedScenario === 'reservations' ? 'active' : ''}`}
              onClick={() => setSelectedScenario('reservations')}
            >
              Cenário com Reservas Reais
              <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.75rem', opacity: 0.8 }}>
                Usa {systemData ? systemData.bookings.total_confirmed : 0} reservas confirmadas
              </small>
            </div>
          </div>
          <button 
            className="run-button" 
            onClick={handleRunSimulation}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Simulando...' : '▶ Iniciar Simulação'}
          </button>
        </Card>

        {/* Card 2: Dados Utilizados na Simulação */}
        <Card title="Dados Utilizados na Simulação">
          {systemData ? (
            <>
              <div className="kpis-grid">
                <div className="kpi-item">
                  <div className="kpi-label">Nº de Balsas</div>
                  <div className="kpi-value">
                    {selectedScenario === 'maintenance' 
                      ? `${Math.max(1, systemData.vessels.operational - 1)}` 
                      : `${systemData.vessels.operational}`}
                    {systemData.vessels.in_maintenance > 0 && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'block', marginTop: '0.25rem' }}>
                        ({systemData.vessels.in_maintenance} em manutenção)
                      </span>
                    )}
                  </div>
                </div>
                <div className="kpi-item">
                  <div className="kpi-label">Capacidade/Balsa</div>
                  <div className="kpi-value">{systemData.capacity.average} veículos</div>
                </div>
                <div className="kpi-item">
                  <div className="kpi-label">Reservas Confirmadas</div>
                  <div className="kpi-value">{systemData.bookings.total_confirmed}</div>
                </div>
                <div className="kpi-item">
                  <div className="kpi-label">Viagens Agendadas</div>
                  <div className="kpi-value">{systemData.trips.scheduled_count}</div>
                </div>
                <div className="kpi-item">
                  <div className="kpi-label">Horas Operação</div>
                  <div className="kpi-value">
                    {systemData.operation.total_hours}h 
                    ({systemData.operation.start_hour}h-{systemData.operation.end_hour}h)
                  </div>
                </div>
                <div className="kpi-item">
                  <div className="kpi-label">Capacidade Total</div>
                  <div className="kpi-value">{systemData.capacity.total} lugares</div>
                </div>
              </div>
              {systemData.vessels.list && systemData.vessels.list.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                    Embarcações:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {systemData.vessels.list.map((vessel) => (
                      <span
                        key={vessel.id}
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          backgroundColor: vessel.status === 'Operacional' ? '#d1fae5' : '#fef3c7',
                          color: vessel.status === 'Operacional' ? '#065f46' : '#92400e',
                          fontWeight: '500'
                        }}
                      >
                        {vessel.name} ({vessel.capacity}) - {vessel.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              Carregando dados do sistema...
            </p>
          )}
        </Card>

        {/* Card 3: Gráficos */}
        <Card title="Executando Simulação" className="charts-card">
          <div className="charts-content">
            {isLoading ? (
              <div className="loading-container">
                <p className="loading-text">Simulando...</p>
                <div className="spinner"></div>
              </div>
            ) : results ? (
              <SimulationResults results={results} />
            ) : (
              <p className="placeholder">Execute a simulação para ver os resultados</p>
            )}
          </div>
        </Card>

        {/* Card 4: Resultados Comparativos */}
        <Card title="Resultados Comparativos dos Cenários">
          <div className="table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Cenário</th>
                  <th>Tempo Médio de Espera</th>
                  <th>Pico Máximo da Fila</th>
                  <th>Total de Veículos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cenário Base</td>
                  <td>
                    {scenarioResults.base 
                      ? `${scenarioResults.base.avgWaitTime.toFixed(1)} min` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.base 
                      ? `${scenarioResults.base.maxQueueSize} veículos` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.base 
                      ? `${scenarioResults.base.totalVehicles} veículos` 
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <td>Cenário Manutenção</td>
                  <td>
                    {scenarioResults.maintenance 
                      ? `${scenarioResults.maintenance.avgWaitTime.toFixed(1)} min` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.maintenance 
                      ? `${scenarioResults.maintenance.maxQueueSize} veículos` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.maintenance 
                      ? `${scenarioResults.maintenance.totalVehicles} veículos` 
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <td>Cenário Reservas</td>
                  <td>
                    {scenarioResults.reservations 
                      ? `${scenarioResults.reservations.avgWaitTime.toFixed(1)} min` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.reservations 
                      ? `${scenarioResults.reservations.maxQueueSize} veículos` 
                      : '—'}
                  </td>
                  <td>
                    {scenarioResults.reservations 
                      ? `${scenarioResults.reservations.totalVehicles} veículos` 
                      : '—'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}

export default SimulacaoPage

