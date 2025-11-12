# 👤 Como Criar Usuário Admin - Métodos

## ✅ Método 1: Via Seeder (MAIS FÁCIL - Recomendado)

Criei um `UserSeeder` que cria o usuário admin automaticamente!

### No Railway:

1. Vá em **Settings** → **Deploy**
2. Adicione um **Pre-deploy step**:
   - Comando: `php artisan db:seed --class=UserSeeder`
3. Salve
4. Faça um novo deploy

**OU** execute via Shell (se encontrar):

```bash
php artisan db:seed --class=UserSeeder
```

### Credenciais do Admin:
- **Email**: `admin@ferry.bot`
- **Senha**: `12345678`

---

## 🔧 Método 2: Via Shell do Railway

### Onde encontrar o Shell:

1. No Railway, clique no serviço **"ferry-bot"**
2. No topo, ao lado de "Architecture" e "Observability", procure por **"shell"** ou **"Shell"**
3. Ou vá em **Settings** → procure **"Shell"** no menu lateral
4. Clique para abrir o terminal

### No Shell, execute:

```bash
php artisan tinker
```

### No tinker, execute:

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@ferry.bot',
    'password' => bcrypt('12345678')
]);
```

### Depois digite:

```bash
exit
```

---

## 🎯 Método 3: Via Pre-deploy (Automático)

1. Vá em **Settings** → **Deploy**
2. Clique em **"+ Add pre-deploy step"**
3. Adicione:
   ```
   php artisan migrate --force && php artisan db:seed
   ```
4. Isso vai rodar TODOS os seeders, incluindo o UserSeeder
5. Salve e faça deploy

---

## ⚡ Recomendação:

Use o **Método 1** ou **Método 3** - são mais fáceis e automáticos!

O usuário admin será criado automaticamente com:
- Email: `admin@ferry.bot`
- Senha: `12345678`

