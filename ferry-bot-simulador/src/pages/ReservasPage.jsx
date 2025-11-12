import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Modal from '../components/Modal'

function ReservasPage() {
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(null) // Guarda o ID da reserva a ser cancelada
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [editPlate, setEditPlate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para buscar reservas (movida para fora do useEffect para poder ser reutilizada)
  async function fetchBookings() {
    try {
      // Usa o endpoint protegido da nossa API
      const response = await api.get('/bookings')

      if (response.data && response.data.data) {
        setBookings(response.data.data)
      } else {
        setBookings(response.data)
      }
    } catch (error) {
      console.error("Erro ao buscar reservas:", error)
      // O interceptor de erros 401 no api.js deve tratar o logout
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  function handleOpenEditModal(booking) {
    setSelectedBooking(booking)
    setEditPlate(booking.vehicle_plate || '') // Pré-preenche a placa atual
    setIsEditModalOpen(true)
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false)
    setSelectedBooking(null)
    setEditPlate('')
  }

  async function handleUpdateBooking() {
    if (!selectedBooking || !editPlate) {
      alert('Por favor, preencha a placa do veículo.')
      return
    }

    setIsSubmitting(true)

    try {
      // A API já espera o campo 'vehicle_plate' no método update
      const response = await api.put(`/bookings/${selectedBooking.id}`, {
        vehicle_plate: editPlate
      })

      if (response.data.success) {
        alert('Reserva atualizada com sucesso!')
        handleCloseEditModal()
        await fetchBookings() // Re-busca os dados para atualizar a tabela
      } else {
        alert(response.data.message || 'Erro ao atualizar reserva.')
      }
    } catch (error) {
      console.error("Erro ao atualizar reserva:", error)
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar a placa. Verifique os dados.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancelBooking(bookingId) {
    // 1. Pedir confirmação ao utilizador
    if (!window.confirm('Tem a certeza que quer cancelar esta reserva? Esta ação não pode ser desfeita.')) {
      return
    }

    setIsCanceling(bookingId) // Ativa o estado de carregamento para este botão

    try {
      // 2. Chamar a API (o token é enviado automaticamente)
      const response = await api.delete(`/bookings/${bookingId}`)

      if (response.data.success) {
        alert('Reserva cancelada com sucesso!')
      } else {
        alert(response.data.message || 'Não foi possível cancelar a reserva.')
      }

      // 3. Atualizar a lista de reservas
      await fetchBookings()

    } catch (error) {
      console.error("Erro ao cancelar reserva:", error)
      const errorMessage = error.response?.data?.message || 'Não foi possível cancelar a reserva.'
      alert(errorMessage)
    } finally {
      setIsCanceling(null) // Desativa o estado de carregamento
    }
  }

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatStatus = (status) => {
    const statusMap = {
      'pendente': 'Pendente',
      'confirmada': 'Confirmada',
      'cancelada': 'Cancelada',
      'concluida': 'Concluída'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmada':
        return 'status-concluida'
      case 'cancelada':
        return 'status-cancelada'
      case 'pendente':
        return 'status-agendada'
      case 'concluida':
        return 'status-concluida'
      default:
        return ''
    }
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Gerenciamento de Reservas</h1>
        <p>A carregar reservas...</p>
      </>
    )
  }

  return (
    <>
      <h1 className="page-title">Gerenciamento de Reservas</h1>
      
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>REFERÊNCIA</th>
              <th>USUÁRIO</th>
              <th>VIAGEM</th>
              <th>VEÍCULO</th>
              <th>STATUS</th>
              <th>AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.booking_reference || 'N/A'}</td>
                  <td>{booking.user?.name || 'N/A'}</td>
                  <td>
                    {booking.trip ? (
                      <>
                        {formatTime(booking.trip.departure_time)} - {booking.trip.trajeto || 'N/A'}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{booking.vehicle_plate || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(booking.status)}`}>
                      {formatStatus(booking.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEditModal(booking)}
                        disabled={(booking.status !== 'pendente' && booking.status !== 'confirmada') || isSubmitting}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: (booking.status === 'pendente' || booking.status === 'confirmada') && !isSubmitting ? '#3b82f6' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: (booking.status === 'pendente' || booking.status === 'confirmada') && !isSubmitting ? 'pointer' : 'not-allowed',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if ((booking.status === 'pendente' || booking.status === 'confirmada') && !isSubmitting) {
                            e.target.style.backgroundColor = '#2563eb'
                          }
                        }}
                        onMouseOut={(e) => {
                          if ((booking.status === 'pendente' || booking.status === 'confirmada') && !isSubmitting) {
                            e.target.style.backgroundColor = '#3b82f6'
                          }
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={booking.status !== 'confirmada' || isCanceling === booking.id || isSubmitting}
                        className="btn-cancelar"
                        style={{
                          backgroundColor: booking.status === 'confirmada' && isCanceling !== booking.id && !isSubmitting ? '#e74c3c' : '#bdc3c7',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: booking.status === 'confirmada' && isCanceling !== booking.id && !isSubmitting ? 'pointer' : 'not-allowed',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (booking.status === 'confirmada' && isCanceling !== booking.id && !isSubmitting) {
                            e.target.style.backgroundColor = '#c0392b'
                          }
                        }}
                        onMouseOut={(e) => {
                          if (booking.status === 'confirmada' && isCanceling !== booking.id && !isSubmitting) {
                            e.target.style.backgroundColor = '#e74c3c'
                          }
                        }}
                      >
                        {isCanceling === booking.id ? 'A cancelar...' : 'Cancelar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                  Nenhuma reserva encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        show={isEditModalOpen} 
        onClose={handleCloseEditModal}
        title="Editar Reserva"
      >
        {selectedBooking && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Referência da Reserva:</p>
              <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>
                {selectedBooking.booking_reference || 'N/A'}
              </p>
              {selectedBooking.trip && (
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  Viagem: {formatTime(selectedBooking.trip.departure_time)} - {selectedBooking.trip.trajeto || 'N/A'}
                </p>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateBooking(); }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="edit-plate"
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Placa do Veículo:
                </label>
                <input
                  id="edit-plate"
                  type="text"
                  value={editPlate}
                  onChange={(e) => setEditPlate(e.target.value.toUpperCase())}
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
                  disabled={isSubmitting || !editPlate}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isSubmitting || !editPlate ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isSubmitting || !editPlate ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  {isSubmitting ? 'A guardar...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ReservasPage

