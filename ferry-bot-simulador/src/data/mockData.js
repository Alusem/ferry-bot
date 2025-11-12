/**
 * Dados Mockados para Demonstração
 * Dados falsos para preencher as páginas de Viagens e Embarcações
 */

export const mockFerries = [
  {
    id: 1,
    nome: 'Ferry Bot 01',
    capacidade: 50,
    status: 'Operacional'
  },
  {
    id: 2,
    nome: 'Ferry Bot 02',
    capacidade: 50,
    status: 'Operacional'
  },
  {
    id: 3,
    nome: 'Ferry Bot 03',
    capacidade: 50,
    status: 'Em Manutenção'
  },
  {
    id: 4,
    nome: 'Ferry Bot 04',
    capacidade: 50,
    status: 'Operacional'
  }
]

export const mockTrips = [
  {
    id: 1,
    horario: '06:30',
    balsa_nome: 'Ferry Bot 01',
    trajeto: 'Ponta da Espera -> Cujupe',
    ocupacao: '42/50',
    status: 'Concluída'
  },
  {
    id: 2,
    horario: '07:15',
    balsa_nome: 'Ferry Bot 02',
    trajeto: 'Cujupe -> Ponta da Espera',
    ocupacao: '48/50',
    status: 'Concluída'
  },
  {
    id: 3,
    horario: '08:00',
    balsa_nome: 'Ferry Bot 04',
    trajeto: 'Ponta da Espera -> Cujupe',
    ocupacao: '35/50',
    status: 'Agendada'
  },
  {
    id: 4,
    horario: '08:45',
    balsa_nome: 'Ferry Bot 01',
    trajeto: 'Cujupe -> Ponta da Espera',
    ocupacao: '50/50',
    status: 'Agendada'
  },
  {
    id: 5,
    horario: '09:30',
    balsa_nome: 'Ferry Bot 02',
    trajeto: 'Ponta da Espera -> Cujupe',
    ocupacao: '28/50',
    status: 'Agendada'
  },
  {
    id: 6,
    horario: '10:15',
    balsa_nome: 'Ferry Bot 04',
    trajeto: 'Cujupe -> Ponta da Espera',
    ocupacao: '0/50',
    status: 'Cancelada'
  }
]

