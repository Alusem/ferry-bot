/**
 * Motor de Simulação de Balsas
 * Simula o sistema de filas de veículos aguardando embarque em balsas
 */

/**
 * Verifica se um minuto está dentro de um período de pico
 */
function isPeakHour(minute, peakHours) {
  return peakHours.some(peak => minute >= peak.start && minute < peak.end);
}

/**
 * Calcula a taxa de chegada de veículos por minuto
 * Durante os picos, 40% do total de veículos chegam
 * Se useReservations for true, distribui uniformemente (suaviza os picos)
 */
function getArrivalRate(minute, avgArrivalsPerDay, operationHours, peakHours, useReservations = false) {
  const totalMinutes = operationHours * 60;
  
  // Se usar reservas, distribuição uniforme (suaviza os picos)
  if (useReservations) {
    return avgArrivalsPerDay / totalMinutes;
  }
  
  // Distribuição normal com picos (40% nos picos, 60% no resto)
  const peakMinutes = peakHours.reduce((sum, peak) => sum + (peak.end - peak.start), 0);
  const normalMinutes = totalMinutes - peakMinutes;
  
  const peakArrivals = Math.floor(avgArrivalsPerDay * 0.4);
  const normalArrivals = avgArrivalsPerDay - peakArrivals;
  
  const peakRate = peakArrivals / peakMinutes;
  const normalRate = normalArrivals / normalMinutes;
  
  return isPeakHour(minute, peakHours) ? peakRate : normalRate;
}

/**
 * Gera chegadas de veículos usando distribuição de Poisson
 */
function generateArrivals(minute, arrivalRate) {
  // Aproximação simples: usar a taxa diretamente com alguma aleatoriedade
  // Para uma simulação mais precisa, usaríamos distribuição de Poisson
  const baseArrivals = Math.floor(arrivalRate);
  const fractional = arrivalRate - baseArrivals;
  const extraArrival = Math.random() < fractional ? 1 : 0;
  return baseArrivals + extraArrival;
}

/**
 * Função principal de simulação
 */
export function runSimulation(params) {
  const {
    numFerries = 4,
    ferryCapacity = 50,
    avgArrivalsPerDay = 1200,
    operationHours = 16,
    operationStart = 6,
    useReservations = false,
    scheduledTrips = [],
    bookingsByHour = {},
    peakHours = [
      { start: 60, end: 180 },   // 7h-9h (60-180 min desde 6h)
      { start: 660, end: 780 }   // 17h-19h (660-780 min desde 6h)
    ]
  } = params;

  const totalMinutes = operationHours * 60; // 960 minutos
  
  // Estruturas de dados
  const queue = []; // Fila de veículos: cada veículo é { arrivalMinute: number, isReservation: boolean }
  const waitTimes = []; // Tempos de espera de cada veículo
  const queueOverTime = []; // Tamanho da fila ao longo do tempo
  
  // Se temos viagens agendadas reais, usar seus horários
  let ferryDepartures = [];
  
  if (scheduledTrips && scheduledTrips.length > 0) {
    // Usar horários reais das viagens
    scheduledTrips.forEach((trip, index) => {
      const tripDate = new Date(trip.departure_time);
      const tripHour = tripDate.getHours();
      const tripMinute = tripDate.getMinutes();
      const minutesFromStart = (tripHour - operationStart) * 60 + tripMinute;
      
      if (minutesFromStart >= 0 && minutesFromStart < totalMinutes) {
        ferryDepartures.push({
          id: index,
          departureMinute: minutesFromStart,
          capacity: ferryCapacity,
          tripId: trip.id
        });
      }
    });
    
    // Ordenar por horário
    ferryDepartures.sort((a, b) => a.departureMinute - b.departureMinute);
  } else {
    // Fallback: usar distribuição uniforme
    for (let i = 0; i < numFerries; i++) {
      ferryDepartures.push({
        id: i,
        departureMinute: i * (totalMinutes / numFerries),
        capacity: ferryCapacity
      });
    }
  }

  // Adicionar reservas confirmadas nas filas antes da simulação
  let totalReservations = 0;
  if (useReservations && bookingsByHour) {
    Object.keys(bookingsByHour).forEach(hour => {
      const hourNum = parseInt(hour);
      const bookingsCount = bookingsByHour[hour];
      totalReservations += bookingsCount;
      const arrivalMinute = (hourNum - operationStart) * 60;
      
      // Distribuir reservas nos 30 minutos antes da partida
      for (let i = 0; i < bookingsCount; i++) {
        const randomOffset = Math.floor(Math.random() * 30); // 0-29 minutos antes
        queue.push({
          arrivalMinute: Math.max(0, arrivalMinute - randomOffset),
          isReservation: true
        });
      }
    });
  }

  // Calcular walk-ins estimados (se usar reservas, subtrair do total)
  const estimatedWalkIns = useReservations 
    ? Math.max(0, avgArrivalsPerDay - totalReservations)
    : avgArrivalsPerDay;

  // Simulação minuto a minuto
  for (let minute = 0; minute < totalMinutes; minute++) {
    // 1. Gerar chegadas de veículos (walk-ins)
    const arrivalRate = getArrivalRate(minute, estimatedWalkIns, operationHours, peakHours, useReservations);
    const arrivals = generateArrivals(minute, arrivalRate);
    
    for (let i = 0; i < arrivals; i++) {
      queue.push({ arrivalMinute: minute, isReservation: false });
    }

    // 2. Processar partidas das balsas (usar horários reais)
    ferryDepartures.forEach(ferry => {
      if (minute === ferry.departureMinute) {
        // A balsa parte e embarca veículos
        const vehiclesToBoard = Math.min(ferry.capacity, queue.length);
        
        for (let i = 0; i < vehiclesToBoard; i++) {
          const vehicle = queue.shift();
          if (vehicle) {
            const waitTime = minute - vehicle.arrivalMinute;
            waitTimes.push(waitTime);
          }
        }
      }
    });

    // 3. Registrar tamanho da fila neste minuto
    queueOverTime.push({
      minute: minute,
      size: queue.length
    });
  }

  // Processar veículos que ficaram na fila ao final
  const finalMinute = totalMinutes;
  while (queue.length > 0) {
    const vehicle = queue.shift();
    const waitTime = finalMinute - vehicle.arrivalMinute;
    waitTimes.push(waitTime);
  }

  // Calcular métricas
  const avgWaitTime = waitTimes.length > 0
    ? waitTimes.reduce((sum, wt) => sum + wt, 0) / waitTimes.length
    : 0;

  const maxQueueSize = queueOverTime.length > 0
    ? Math.max(...queueOverTime.map(q => q.size))
    : 0;

  // Preparar dados para gráficos
  // waitTimesData: array simples de tempos de espera (para histograma)
  const waitTimesData = waitTimes;

  // queueOverTimeData: array de objetos { minute, size } (para gráfico de linha)
  const queueOverTimeData = queueOverTime;

  return {
    avgWaitTime: Math.round(avgWaitTime * 10) / 10, // Arredondar para 1 casa decimal
    maxQueueSize,
    waitTimesData,
    queueOverTimeData,
    totalVehicles: waitTimes.length
  };
}

