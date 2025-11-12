# Ferry Bot - Sistema de Gestão de Balsas

Sistema completo de gestão para operação de balsas, incluindo painel administrativo, simulação operacional e relatórios analíticos.

## 📋 Estrutura do Projeto

```
Ferrie/
├── ferry-bot-api/          # Backend Laravel (API REST)
└── ferry-bot-simulador/    # Frontend React (Painel de Gestão)
```

## 🚀 Tecnologias

### Backend
- **Laravel 12** - Framework PHP
- **Laravel Sanctum** - Autenticação API
- **SQLite** - Banco de dados
- **PHP 8.2+**

### Frontend
- **React 19** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Chart.js** - Gráficos
- **Vite** - Build tool

## 📦 Funcionalidades

### 🎯 Módulos Principais

1. **Dashboard** - Visão geral do sistema
2. **Viagens** - Gerenciamento de viagens (CRUD completo)
3. **Embarcações** - Gerenciamento de embarcações (CRUD completo)
4. **Reservas** - Gerenciamento de reservas (CRUD completo)
5. **Simulação** - Simulação operacional baseada em dados reais
6. **Relatórios** - Análises e estatísticas para gestores
7. **Feedback** - Feedback e reclamações dos usuários

### ✨ Destaques

- ✅ Autenticação completa com tokens
- ✅ CRUD completo para todas as entidades
- ✅ Simulação conectada ao sistema real
- ✅ Relatórios analíticos avançados
- ✅ Validações de negócio robustas
- ✅ Interface responsiva e moderna

## 🛠️ Instalação

### Pré-requisitos

- PHP 8.2 ou superior
- Composer
- Node.js 18+ e npm
- SQLite (ou MySQL/PostgreSQL)

### Backend (ferry-bot-api)

```bash
cd ferry-bot-api

# Instalar dependências
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Configurar banco de dados no .env
# DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite

# Criar banco de dados
touch database/database.sqlite

# Executar migrações e seeders
php artisan migrate:fresh --seed

# Iniciar servidor
php artisan serve
```

O backend estará disponível em `http://127.0.0.1:8000`

### Frontend (ferry-bot-simulador)

```bash
cd ferry-bot-simulador

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 👤 Credenciais Padrão

Após executar os seeders, você pode criar um usuário admin:

```bash
cd ferry-bot-api
php artisan tinker

# No tinker:
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@ferry.bot',
    'password' => bcrypt('12345678')
]);
```

## 📡 Endpoints da API

### Públicos
- `GET /api/v1/public/vessels` - Listar embarcações
- `GET /api/v1/public/trips` - Listar viagens

### Protegidos (requer autenticação)
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/vessels` - Gerenciar embarcações
- `GET /api/v1/trips` - Gerenciar viagens
- `GET /api/v1/bookings` - Gerenciar reservas
- `GET /api/v1/reports` - Feedback dos usuários
- `GET /api/v1/reports/analytics` - Relatórios analíticos
- `GET /api/v1/simulation/data` - Dados para simulação

## 🎮 Como Usar

1. **Login**: Acesse o frontend e faça login com as credenciais do admin
2. **Dashboard**: Visualize estatísticas gerais do sistema
3. **Viagens**: Crie, edite e gerencie viagens
4. **Embarcações**: Gerencie o estado das embarcações
5. **Reservas**: Visualize e gerencie reservas
6. **Simulação**: Execute simulações baseadas em dados reais
7. **Relatórios**: Analise estatísticas e métricas
8. **Feedback**: Veja feedback dos usuários

## 📊 Simulação

A simulação utiliza dados reais do sistema:
- ✅ Estado atual das embarcações (operacionais vs manutenção)
- ✅ Viagens agendadas para a data selecionada
- ✅ Reservas confirmadas por horário
- ✅ Capacidade real das embarcações
- ✅ Horários de operação baseados nas viagens

## 🔒 Segurança

- Autenticação via Laravel Sanctum
- Tokens armazenados no localStorage
- Rotas protegidas no backend
- Validações de entrada
- Proteção CSRF

## 📝 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## 👨‍💻 Desenvolvido por

Samuel Melo

---

**Nota**: Este é um sistema de gestão completo desenvolvido para apresentação acadêmica.

