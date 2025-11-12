import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SimulationResults({ results }) {
  if (!results) {
    return null;
  }

  // Preparar dados para o gráfico de linha (Tamanho da Fila ao Longo do Tempo)
  // Reduzir pontos para melhor performance (amostrar a cada 10 minutos)
  const sampledQueueData = results.queueOverTimeData.filter((_, index) => index % 10 === 0);
  const queueChartData = {
    labels: sampledQueueData.map(d => {
      const hours = Math.floor(d.minute / 60) + 6; // Começa às 6h
      const minutes = d.minute % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Tamanho da Fila',
        data: sampledQueueData.map(d => d.size),
        borderColor: 'rgb(52, 152, 219)',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const queueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Tamanho da Fila ao Longo do Tempo'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Veículos na Fila'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Horário'
        }
      }
    }
  };

  // Preparar dados para o histograma (Distribuição dos Tempos de Espera)
  // Criar bins para o histograma
  const maxWaitTime = Math.max(...results.waitTimesData);
  const numBins = 20;
  const binSize = Math.ceil(maxWaitTime / numBins);
  const bins = Array(numBins).fill(0);
  
  results.waitTimesData.forEach(waitTime => {
    const binIndex = Math.min(Math.floor(waitTime / binSize), numBins - 1);
    bins[binIndex]++;
  });

  const waitTimesChartData = {
    labels: bins.map((_, index) => {
      const start = index * binSize;
      const end = (index + 1) * binSize;
      return `${start}-${end} min`;
    }),
    datasets: [
      {
        label: 'Número de Veículos',
        data: bins,
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
        borderColor: 'rgba(231, 76, 60, 1)',
        borderWidth: 1
      }
    ]
  };

  const waitTimesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'Distribuição dos Tempos de Espera'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Veículos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Tempo de Espera (minutos)'
        }
      }
    }
  };

  return (
    <div className="simulation-results">
      {/* KPIs */}
      <div className="kpis-container">
        <div className="kpi-card">
          <h3>Tempo Médio de Espera</h3>
          <p className="kpi-value">{results.avgWaitTime.toFixed(2)} minutos</p>
        </div>
        <div className="kpi-card">
          <h3>Pico Máximo da Fila</h3>
          <p className="kpi-value">{results.maxQueueSize} veículos</p>
        </div>
        <div className="kpi-card">
          <h3>Total de Veículos</h3>
          <p className="kpi-value">{results.totalVehicles} veículos</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-container">
        <div className="chart-wrapper">
          <Line data={queueChartData} options={queueChartOptions} />
        </div>
        <div className="chart-wrapper">
          <Bar data={waitTimesChartData} options={waitTimesChartOptions} />
        </div>
      </div>
    </div>
  );
}

export default SimulationResults;

