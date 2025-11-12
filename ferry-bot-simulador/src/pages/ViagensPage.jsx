import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'

function ViagensPage() {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedTripForEdit, setSelectedTripForEdit] = useState(null)
  const [allVessels, setAllVessels] = useState([])
  const [newTrip, setNewTrip] = useState({
    vessel_id: '',
    departure_time: '',
    trajeto: 'Ponta da Espera -> Cujupe',
    status: 'agendada',
    ocupacao: '0/50'
  })
  const [editTripData, setEditTripData] = useState({
    vessel_id: '',
    departure_time: '',
    trajeto: '',
    status: ''
  })
  const { user } = useAuth()

  // Função para buscar dados (movida para fora do useEffect para poder ser reutilizada)
  async function fetchData() {
    try {
      const [tripsResponse, vesselsResponse] = await Promise.all([
        api.get('/public/trips'),
        api.get('/public/vessels')
      ])

      // Processar viagens
      if (tripsResponse.data && tripsResponse.data.data) {
        setTrips(tripsResponse.data.data)
      } else {
        setTrips(tripsResponse.data)
      }

      // Processar embarcações
      if (vesselsResponse.data && vesselsResponse.data.data) {
        setAllVessels(vesselsResponse.data.data)
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getStatusClass = (status) => {
    switch (status) {
      case 'concluida':
        return 'status-concluida'
      case 'cancelada':
        return 'status-cancelada'
      case 'agendada':
        return 'status-agendada'
      case 'em_curso':
        return 'status-agendada' // Usar o mesmo estilo para "em curso"
      default:
        return ''
    }
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

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  function formatDatetimeForInput(datetime) {
    if (!datetime) return ''
    const d = new Date(datetime)
    // Formata para 'YYYY-MM-DDTHH:MM'
    return d.toISOString().slice(0, 16)
  }

  function isTripInFuture(departureTime) {
    if (!departureTime) return false
    return new Date(departureTime) > new Date()
  }

  const handleOpenModal = (trip) => {
    setSelectedTrip(trip)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTrip(null)
    setVehiclePlate('')
  }

  const handleCreateBooking = async () => {
    if (!vehiclePlate) {
      alert('Por favor, insira a placa do veículo.')
      return
    }

    if (!user) {
      alert('Usuário não autenticado.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/bookings', {
        user_id: user.id,
        trip_id: selectedTrip.id,
        vehicle_plate: vehiclePlate
      })

      if (response.data.success) {
        alert(`Reserva criada com sucesso! Referência: ${response.data.data.booking_reference}`)
        handleCloseModal()
        // Recarregar a lista de viagens para atualizar ocupação
        await fetchData()
      } else {
        alert(response.data.message || 'Erro ao criar reserva.')
      }
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      let errorMessage = 'Erro ao criar reserva. Verifique a placa e tente novamente.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenCreateModal() {
    setIsCreateModalOpen(true)
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false)
    setNewTrip({
      vessel_id: '',
      departure_time: '',
      trajeto: 'Ponta da Espera -> Cujupe',
      status: 'agendada',
      ocupacao: '0/50'
    })
  }

  async function handleCreateTrip() {
    if (!newTrip.vessel_id || !newTrip.departure_time) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar os dados para enviar (ocupacao não é enviado, é calculado no backend)
      const tripData = {
        vessel_id: parseInt(newTrip.vessel_id),
        departure_time: newTrip.departure_time,
        trajeto: newTrip.trajeto,
        status: newTrip.status
      }

      const response = await api.post('/trips', tripData)

      if (response.data.success) {
        alert('Nova viagem criada com sucesso!')
        handleCloseCreateModal()
        await fetchData() // Recarregar a lista de viagens
      } else {
        alert(response.data.message || 'Erro ao criar viagem.')
      }
    } catch (error) {
      console.error("Erro ao criar viagem:", error)
      const errorMessage = error.response?.data?.message || 'Erro ao criar viagem. Verifique os dados e tente novamente.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenEditModal(trip) {
    setSelectedTripForEdit(trip)
    setEditTripData({
      vessel_id: trip.vessel_id?.toString() || '',
      departure_time: formatDatetimeForInput(trip.departure_time),
      trajeto: trip.trajeto || 'Ponta da Espera -> Cujupe',
      status: trip.status || 'agendada'
    })
    setIsEditModalOpen(true)
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false)
    setSelectedTripForEdit(null)
    setEditTripData({
      vessel_id: '',
      departure_time: '',
      trajeto: '',
      status: ''
    })
  }

  function handleEditFormChange(field, value) {
    setEditTripData({
      ...editTripData,
      [field]: value
    })
  }

  async function handleUpdateTrip() {
    if (!selectedTripForEdit) return

    if (!editTripData.vessel_id || !editTripData.departure_time) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar os dados para enviar
      const tripData = {
        vessel_id: parseInt(editTripData.vessel_id),
        departure_time: editTripData.departure_time,
        trajeto: editTripData.trajeto,
        status: editTripData.status
      }

      const response = await api.put(`/trips/${selectedTripForEdit.id}`, tripData)

      if (response.data.success) {
        alert('Viagem atualizada com sucesso!')
        handleCloseEditModal()
        await fetchData() // Re-busca os dados para atualizar a tabela
      } else {
        alert(response.data.message || 'Erro ao atualizar viagem.')
      }
    } catch (error) {
      console.error("Erro ao atualizar viagem:", error)
      let errorMessage = 'Erro ao atualizar viagem. Verifique os dados e tente novamente.'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // Traduzir mensagens de validação do Laravel
      if (errorMessage.includes('departure time field must be a date after now')) {
        errorMessage = 'A data/hora da partida deve ser no futuro'
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteTrip(tripId) {
    // Confirmação para prevenir deleções acidentais
    const isConfirmed = window.confirm(
      'Tem a certeza que quer deletar esta viagem? Esta ação é permanente e irá falhar se a viagem já tiver reservas associadas.'
    )

    if (!isConfirmed) {
      return // Utilizador cancelou
    }

    setIsSubmitting(true)

    try {
      // O nosso 'api.js' já envia o token de admin
      const response = await api.delete(`/trips/${tripId}`)

      if (response.data.success) {
        alert('Viagem deletada com sucesso!')
        await fetchData() // Re-busca os dados para atualizar a lista
      } else {
        alert(response.data.message || 'Erro ao deletar viagem.')
      }
    } catch (error) {
      console.error("Erro ao deletar viagem:", error)
      // A API (corretamente) irá retornar um erro se a viagem tiver reservas (foreign key)
      const errorMessage = error.response?.data?.message || 'Erro ao deletar. Verifique se a viagem não possui reservas associadas.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Gerenciamento de Viagens</h1>
        <p>A carregar viagens...</p>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Gerenciamento de Viagens</h1>
        <button
          onClick={handleOpenCreateModal}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#059669'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#10b981'
          }}
        >
          <span>+</span> Adicionar Viagem
        </button>
      </div>
      
      <div className="filters-container">
        <div className="filter-group">
          <label>Buscar por ID:</label>
          <input type="text" placeholder="Digite o ID..." disabled />
        </div>
        <div className="filter-group">
          <label>Data:</label>
          <input type="date" disabled />
        </div>
        <div className="filter-group">
          <label>Status:</label>
          <select disabled>
            <option>Todos os Status</option>
            <option>Agendada</option>
            <option>Concluída</option>
            <option>Cancelada</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>HORÁRIO</th>
              <th>EMBARCAÇÃO</th>
              <th>TRAJETO</th>
              <th>OCUPAÇÃO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip) => (
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
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEditModal(trip)}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: isSubmitting ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (!isSubmitting) {
                          e.target.style.backgroundColor = '#2563eb'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSubmitting) {
                          e.target.style.backgroundColor = '#3b82f6'
                        }
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      disabled={trip.status !== 'agendada' || isSubmitting}
                      className="btn-delete"
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: trip.status === 'agendada' && !isSubmitting ? '#e74c3c' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: trip.status === 'agendada' && !isSubmitting ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (trip.status === 'agendada' && !isSubmitting) {
                          e.target.style.backgroundColor = '#c0392b'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (trip.status === 'agendada' && !isSubmitting) {
                          e.target.style.backgroundColor = '#e74c3c'
                        }
                      }}
                    >
                      Deletar
                    </button>
                    <button
                      onClick={() => handleOpenModal(trip)}
                      disabled={trip.status !== 'agendada' || isSubmitting || !isTripInFuture(trip.departure_time)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: (trip.status === 'agendada' && !isSubmitting && isTripInFuture(trip.departure_time)) ? '#10b981' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: (trip.status === 'agendada' && !isSubmitting && isTripInFuture(trip.departure_time)) ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => {
                        if (trip.status === 'agendada' && !isSubmitting && isTripInFuture(trip.departure_time)) {
                          e.target.style.backgroundColor = '#059669'
                        }
                      }}
                      onMouseOut={(e) => {
                        if (trip.status === 'agendada' && !isSubmitting && isTripInFuture(trip.departure_time)) {
                          e.target.style.backgroundColor = '#10b981'
                        }
                      }}
                    >
                      Reservar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        show={isModalOpen} 
        onClose={handleCloseModal}
        title="Criar Nova Reserva"
      >
        {selectedTrip && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Viagem selecionada:</p>
              <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>
                {formatTime(selectedTrip.departure_time)} - {selectedTrip.trajeto || 'N/A'}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Embarcação: {selectedTrip.vessel?.name || 'N/A'}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateBooking(); }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Placa do Veículo
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  placeholder="ABC-1234"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    textTransform: 'uppercase'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !vehiclePlate}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isSubmitting || !vehiclePlate ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isSubmitting || !vehiclePlate ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {isSubmitting ? 'A criar...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Modal 
        show={isCreateModalOpen} 
        onClose={handleCloseCreateModal}
        title="Adicionar Nova Viagem"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateTrip(); }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="vessel_id"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Embarcação:
            </label>
            <select
              id="vessel_id"
              value={newTrip.vessel_id}
              onChange={(e) => setNewTrip({...newTrip, vessel_id: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Selecione uma embarcação</option>
              {allVessels.map(vessel => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name} ({vessel.status || 'Operacional'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="departure_time"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Data/Hora da Partida:
            </label>
            <input
              id="departure_time"
              type="datetime-local"
              value={newTrip.departure_time}
              onChange={(e) => setNewTrip({...newTrip, departure_time: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="trajeto"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Trajeto:
            </label>
            <select
              id="trajeto"
              value={newTrip.trajeto}
              onChange={(e) => setNewTrip({...newTrip, trajeto: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="Ponta da Espera -> Cujupe">Ponta da Espera → Cujupe</option>
              <option value="Cujupe -> Ponta da Espera">Cujupe → Ponta da Espera</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="status-create"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Status:
            </label>
            <select
              id="status-create"
              value={newTrip.status}
              onChange={(e) => setNewTrip({...newTrip, status: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="agendada">Agendada</option>
              <option value="em_curso">Em Curso</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCloseCreateModal}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newTrip.vessel_id || !newTrip.departure_time}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isSubmitting || !newTrip.vessel_id || !newTrip.departure_time ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isSubmitting || !newTrip.vessel_id || !newTrip.departure_time ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'A criar...' : 'Salvar Nova Viagem'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal 
        show={isEditModalOpen} 
        onClose={handleCloseEditModal}
        title="Editar Viagem"
      >
        {selectedTripForEdit && (
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateTrip(); }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="edit-vessel_id"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Embarcação:
              </label>
              <select
                id="edit-vessel_id"
                value={editTripData.vessel_id}
                onChange={(e) => handleEditFormChange('vessel_id', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Selecione uma embarcação</option>
                {allVessels.map(vessel => (
                  <option key={vessel.id} value={vessel.id}>
                    {vessel.name} ({vessel.status || 'Operacional'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="edit-departure_time"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Data/Hora da Partida:
              </label>
              <input
                id="edit-departure_time"
                type="datetime-local"
                value={editTripData.departure_time}
                onChange={(e) => handleEditFormChange('departure_time', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="edit-trajeto"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Trajeto:
              </label>
              <select
                id="edit-trajeto"
                value={editTripData.trajeto}
                onChange={(e) => handleEditFormChange('trajeto', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="Ponta da Espera -> Cujupe">Ponta da Espera → Cujupe</option>
                <option value="Cujupe -> Ponta da Espera">Cujupe → Ponta da Espera</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                htmlFor="edit-status"
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#374151',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Status:
              </label>
              <select
                id="edit-status"
                value={editTripData.status}
                onChange={(e) => handleEditFormChange('status', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  backgroundColor: 'white'
                }}
              >
                <option value="agendada">Agendada</option>
                <option value="em_curso">Em Curso</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCloseEditModal}
                disabled={isSubmitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !editTripData.vessel_id || !editTripData.departure_time}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isSubmitting || !editTripData.vessel_id || !editTripData.departure_time ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isSubmitting || !editTripData.vessel_id || !editTripData.departure_time ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isSubmitting ? 'A guardar...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}

export default ViagensPage

