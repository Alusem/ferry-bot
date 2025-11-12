# 🎉 Deploy Backend Concluído! Próximos Passos

## ✅ O que já está feito:
- ✅ Backend deployado no Railway
- ✅ Serviço ativo e rodando

## 📋 Próximos Passos:

### 1. Expor o Serviço (Criar URL Pública)

1. No Railway, vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"** ou **"Public Networking"**
3. Isso vai criar uma URL pública tipo: `https://ferry-bot-xxxxx.railway.app`
4. **Copie essa URL** - você vai precisar dela!

### 2. Configurar Banco de Dados

**Opção A: Usar SQLite (mais simples)**
- Já está configurado nas variáveis de ambiente
- Mas pode precisar ajustar o caminho

**Opção B: Adicionar PostgreSQL (recomendado para produção)**
1. No Railway, clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
2. Isso cria um banco de dados
3. Copie as variáveis de ambiente que o Railway gera
4. Adicione no serviço "ferry-bot":
   - `DB_CONNECTION=pgsql`
   - `DB_HOST=` (vem do PostgreSQL)
   - `DB_DATABASE=` (vem do PostgreSQL)
   - `DB_USERNAME=` (vem do PostgreSQL)
   - `DB_PASSWORD=` (vem do PostgreSQL)

### 3. Executar Migrations

**Método 1: Via Pre-deploy (Recomendado)**
1. Vá em **Settings** → **Deploy**
2. Clique em **"+ Add pre-deploy step"**
3. Adicione o comando: `php artisan migrate --force`
4. Salve

**Método 2: Via Shell**
1. Vá em **Settings** → **Shell**
2. Execute:
   ```bash
   php artisan migrate --force
   php artisan db:seed
   ```

### 4. Criar Usuário Admin

**Via Shell do Railway:**
1. Vá em **Settings** → **Shell**
2. Execute:
   ```bash
   php artisan tinker
   ```
3. No tinker, execute:
   ```php
   \App\Models\User::create([
       'name' => 'Admin',
       'email' => 'admin@ferry.bot',
       'password' => bcrypt('12345678')
   ]);
   ```
4. Digite `exit` para sair

### 5. Atualizar CORS no Backend

1. No Railway, vá em **Variables**
2. Adicione:
   - `FRONTEND_URL` = URL do seu frontend (você vai criar depois)

### 6. Fazer Deploy do Frontend

**Opção 1: Vercel (Recomendado)**
1. Acesse: https://vercel.com
2. Login com GitHub
3. "Add New Project" → Importe `Alusem/ferry-bot`
4. Configure:
   - **Root Directory**: `ferry-bot-simulador`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Adicione variável de ambiente:
   - `VITE_API_URL` = URL do Railway (ex: `https://ferry-bot-xxxxx.railway.app/api/v1`)
6. Deploy!

**Opção 2: Netlify**
- Similar ao Vercel, mas no Netlify

### 7. Atualizar Frontend para usar a URL do Railway

No arquivo `ferry-bot-simulador/src/services/api.js`, atualize:

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://ferry-bot-xxxxx.railway.app/api/v1'
});
```

## 🎯 Checklist Final:

- [ ] Backend exposto (URL pública criada)
- [ ] Banco de dados configurado
- [ ] Migrations executadas
- [ ] Usuário admin criado
- [ ] CORS configurado
- [ ] Frontend deployado
- [ ] Frontend conectado ao backend
- [ ] Testar login
- [ ] Pronto para apresentação! 🎉

## 🚀 Ordem Recomendada:

1. Expor backend (gerar URL)
2. Executar migrations
3. Criar usuário admin
4. Deploy do frontend
5. Conectar frontend ao backend
6. Testar tudo
7. Pronto!

