import React, { useState, useEffect } from 'react'
import api from '../services/api'
import Card from '../components/Card'
import Modal from '../components/Modal'

function EmbarcacoesPage() {
  const [ferries, setFerries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedVessel, setSelectedVessel] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newVessel, setNewVessel] = useState({
    name: '',
    capacity: 50,
    status: 'Operacional'
  })

  // Função para buscar embarcações (movida para fora do useEffect para poder ser reutilizada)
  async function fetchFerries() {
    try {
      // Usa o endpoint público da nossa API Laravel
      const response = await api.get('/public/vessels')
      setFerries(response.data.data) // Salva os dados no estado (response.data.data porque a API retorna { success, data, message })
    } catch (error) {
      console.error("Erro ao buscar embarcações:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFerries()
  }, [])

  function handleOpenEditModal(vessel) {
    setSelectedVessel(vessel)
    setNewStatus(vessel.status || 'Operacional') // Pré-preenche o status atual
    setIsEditModalOpen(true)
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false)
    setSelectedVessel(null)
    setNewStatus('')
  }

  function handleOpenCreateModal() {
    setIsCreateModalOpen(true)
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false)
    setNewVessel({
      name: '',
      capacity: 50,
      status: 'Operacional'
    })
  }

  async function handleCreateVessel() {
    if (!newVessel.name || !newVessel.capacity) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)

    try {
      // O nosso 'api.js' já envia o token de admin
      const response = await api.post('/vessels', newVessel)

      if (response.data.success) {
        alert('Nova embarcação criada com sucesso!')
        handleCloseCreateModal()
        await fetchFerries() // Re-busca os dados para atualizar a lista
      } else {
        alert(response.data.message || 'Erro ao criar embarcação.')
      }
    } catch (error) {
      console.error("Erro ao criar embarcação:", error)
      const errorMessage = error.response?.data?.message || 'Erro ao criar embarcação.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteVessel(vesselId) {
    // Confirmação para prevenir deleções acidentais
    const isConfirmed = window.confirm(
      'Tem a certeza que quer deletar esta embarcação? Esta ação é permanente e pode falhar se a embarcação tiver viagens associadas.'
    )

    if (!isConfirmed) {
      return // Utilizador cancelou
    }

    setIsSubmitting(true)

    try {
      // O nosso 'api.js' já envia o token de admin
      const response = await api.delete(`/vessels/${vesselId}`)

      if (response.data.success) {
        alert('Embarcação deletada com sucesso!')
        await fetchFerries() // Re-busca os dados para atualizar a lista
      } else {
        alert(response.data.message || 'Erro ao deletar embarcação.')
      }
    } catch (error) {
      console.error("Erro ao deletar embarcação:", error)
      // A API (corretamente) irá retornar um erro se a embarcação tiver viagens (foreign key)
      const errorMessage = error.response?.data?.message || 'Erro ao deletar. Verifique se a embarcação não possui viagens ativas.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateVessel() {
    if (!selectedVessel || !newStatus) return

    setIsSubmitting(true)

    try {
      // O nosso 'api.js' já envia o token de admin
      const response = await api.put(`/vessels/${selectedVessel.id}`, {
        status: newStatus
      })

      if (response.data.success) {
        alert('Embarcação atualizada com sucesso!')
        handleCloseEditModal()
        await fetchFerries() // Re-busca os dados para atualizar a lista
      } else {
        alert(response.data.message || 'Erro ao atualizar embarcação.')
      }
    } catch (error) {
      console.error("Erro ao atualizar embarcação:", error)
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar embarcação.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Operacional':
        return 'status-operacional'
      case 'Em Manutenção':
        return 'status-manutencao'
      default:
        return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operacional':
        return { bg: '#d1fae5', text: '#065f46' }
      case 'Em Manutenção':
        return { bg: '#fef3c7', text: '#92400e' }
      default:
        return { bg: '#e2e8f0', text: '#475569' }
    }
  }

  // Obtém o status da embarcação (agora vem direto da API)
  const getVesselStatus = (vessel) => {
    return vessel.status || 'Operacional' // Usa o status da API ou padrão
  }

  if (isLoading) {
    return (
      <>
        <h1 className="page-title">Gerenciamento de Embarcações</h1>
        <p>A carregar embarcações...</p>
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Gerenciamento de Embarcações</h1>
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
          <span>+</span> Adicionar Embarcação
        </button>
      </div>
      
      <div className="cards-grid">
        {ferries.map((ferry) => {
          const status = getVesselStatus(ferry)
          const statusColor = getStatusColor(status)
          return (
            <Card key={ferry.id}>
              <div className="ferry-card-content">
                <h3 className="ferry-name">{ferry.name}</h3>
                <p className="ferry-capacity">Capacidade: {ferry.capacity} veículos</p>
                <div className="ferry-status">
                  <span 
                    className={`status-badge ${getStatusClass(status)}`}
                    style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text
                    }}
                  >
                    {status}
                  </span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(ferry)}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
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
                    onClick={() => handleDeleteVessel(ferry.id)}
                    disabled={isSubmitting}
                    className="btn-delete"
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      backgroundColor: isSubmitting ? '#9ca3af' : '#e74c3c',
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
                        e.target.style.backgroundColor = '#c0392b'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSubmitting) {
                        e.target.style.backgroundColor = '#e74c3c'
                      }
                    }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal 
        show={isEditModalOpen} 
        onClose={handleCloseEditModal}
        title="Editar Embarcação"
      >
        {selectedVessel && (
          <div>
            <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Embarcação:</p>
              <p style={{ margin: 0, fontWeight: '500', color: '#1e293b' }}>
                {selectedVessel.name}
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                Capacidade: {selectedVessel.capacity} veículos
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateVessel(); }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="status"
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
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
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
                  <option value="Operacional">Operacional</option>
                  <option value="Em Manutenção">Em Manutenção</option>
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
                  disabled={isSubmitting || !newStatus}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isSubmitting || !newStatus ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: isSubmitting || !newStatus ? 'not-allowed' : 'pointer',
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

      <Modal 
        show={isCreateModalOpen} 
        onClose={handleCloseCreateModal}
        title="Adicionar Nova Embarcação"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateVessel(); }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Nome:
            </label>
            <input
              id="name"
              type="text"
              value={newVessel.name}
              onChange={(e) => setNewVessel({...newVessel, name: e.target.value})}
              required
              placeholder="Ex: Ferry Bot 05"
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
              htmlFor="capacity"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Capacidade:
            </label>
            <input
              id="capacity"
              type="number"
              value={newVessel.capacity}
              onChange={(e) => setNewVessel({...newVessel, capacity: parseInt(e.target.value) || 50})}
              required
              min="1"
              max="1000"
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
              value={newVessel.status}
              onChange={(e) => setNewVessel({...newVessel, status: e.target.value})}
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
              <option value="Operacional">Operacional</option>
              <option value="Em Manutenção">Em Manutenção</option>
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
              disabled={isSubmitting || !newVessel.name || !newVessel.capacity}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isSubmitting || !newVessel.name || !newVessel.capacity ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: isSubmitting || !newVessel.name || !newVessel.capacity ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isSubmitting ? 'A criar...' : 'Salvar Nova Embarcação'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default EmbarcacoesPage

