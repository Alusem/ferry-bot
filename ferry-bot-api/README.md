# Ferry Bot API

Backend Laravel para o sistema de gestão de balsas.

## 🚀 Instalação Rápida

```bash
# Instalar dependências
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Criar banco de dados SQLite
touch database/database.sqlite

# Executar migrações e seeders
php artisan migrate:fresh --seed

# Iniciar servidor
php artisan serve
```

## 📡 Endpoints

### Autenticação
- `POST /api/v1/auth/login` - Login

### Públicos
- `GET /api/v1/public/vessels` - Listar embarcações
- `GET /api/v1/public/trips` - Listar viagens

### Protegidos (requer token)
- `GET /api/v1/vessels` - CRUD de embarcações
- `GET /api/v1/trips` - CRUD de viagens
- `GET /api/v1/bookings` - CRUD de reservas
- `GET /api/v1/reports` - Feedback
- `GET /api/v1/reports/analytics` - Relatórios
- `GET /api/v1/simulation/data` - Dados para simulação

## 👤 Criar Usuário Admin

```bash
php artisan tinker

\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@ferry.bot',
    'password' => bcrypt('12345678')
]);
```

## 🗄️ Banco de Dados

O projeto usa SQLite por padrão. O arquivo está em `database/database.sqlite`.

Para usar MySQL/PostgreSQL, configure no `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ferry_bot
DB_USERNAME=root
DB_PASSWORD=
```
