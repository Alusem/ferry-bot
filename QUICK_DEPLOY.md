# ⚡ Deploy Rápido - 15 Minutos

## 🎯 Opção Mais Rápida: Vercel + Railway

### 1️⃣ Frontend no Vercel (5 min)

1. Acesse: https://vercel.com/new
2. Login com GitHub
3. Importe: `Alusem/ferry-bot`
4. Configure:
   - **Root Directory**: `ferry-bot-simulador`
   - **Framework**: Vite
5. Adicione variável:
   - `VITE_API_URL` = (URL do backend - você vai pegar depois)
6. Deploy!

### 2️⃣ Backend no Railway (10 min)

1. Acesse: https://railway.app/new
2. Login com GitHub
3. "Deploy from GitHub repo" → `Alusem/ferry-bot`
4. Configure:
   - **Root Directory**: `ferry-bot-api`
   - **Build**: `composer install --no-dev`
   - **Start**: `php artisan serve --host=0.0.0.0 --port=$PORT`
5. Variáveis de ambiente:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=(gere localmente: php artisan key:generate --show)
   DB_CONNECTION=sqlite
   DB_DATABASE=/tmp/database.sqlite
   ```
6. Adicione MySQL (gratuito) ou use SQLite
7. Deploy!

### 3️⃣ Conectar Frontend ao Backend

1. Copie a URL do Railway (ex: `https://ferry-bot-api.railway.app`)
2. No Vercel, edite variáveis de ambiente:
   - `VITE_API_URL` = `https://ferry-bot-api.railway.app/api/v1`
3. Redeploy do frontend

### 4️⃣ Configurar Banco de Dados

No Railway, abra o terminal e execute:
```bash
php artisan migrate:fresh --seed
php artisan tinker
# No tinker:
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@ferry.bot',
    'password' => bcrypt('12345678')
]);
```

### 5️⃣ Pronto! 🎉

- Frontend: `https://ferry-bot-simulador.vercel.app`
- Backend: `https://ferry-bot-api.railway.app`

---

## 🔄 Alternativa: Render.com (100% Gratuito)

### Backend + Frontend no Render

1. Acesse: https://render.com
2. "New" → "Web Service" (backend)
3. "New" → "Static Site" (frontend)
4. Siga instruções similares

**Vantagem**: Totalmente gratuito (sem cartão de crédito)  
**Desvantagem**: Pode "dormir" após 15min de inatividade

---

## ✅ Checklist Rápido

- [ ] Frontend deployado
- [ ] Backend deployado  
- [ ] Variável `VITE_API_URL` configurada
- [ ] Banco de dados migrado
- [ ] Usuário admin criado
- [ ] Testado login
- [ ] Pronto para apresentação!

**Tempo total**: ~15-20 minutos

