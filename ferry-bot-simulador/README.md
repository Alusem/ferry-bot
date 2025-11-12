# Ferry Bot Simulador

Frontend React para o painel de gestão do sistema de balsas.

## 🚀 Instalação Rápida

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Configuração

O frontend está configurado para se conectar ao backend em `http://127.0.0.1:8000`.

Para alterar, edite `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1'
});
```

## 📦 Dependências Principais

- React 19
- React Router DOM
- Axios
- Chart.js
- Vite

## 🎨 Estrutura

```
src/
├── components/     # Componentes reutilizáveis
├── context/        # Context API (Auth)
├── pages/         # Páginas da aplicação
├── services/      # Serviços (API)
└── simulationEngine.js  # Motor de simulação
```

## 🚀 Deploy

Para produção, execute:

```bash
npm run build
```

Os arquivos estarão em `dist/` e podem ser servidos por qualquer servidor web estático.

