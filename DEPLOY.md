# 🚀 Guia de Deploy Gratuito - Ferry Bot

## ✅ O que foi enviado para o GitHub

✅ Backend Laravel completo (`ferry-bot-api/`)  
✅ Frontend React completo (`ferry-bot-simulador/`)  
✅ README.md com documentação  
✅ .gitignore configurado  
✅ Migrations e Seeders  

## 📋 O que você precisa fazer localmente antes do deploy

1. **Criar arquivo `.env` no backend** (copiar do `.env.example`)
2. **Gerar `APP_KEY`**: `php artisan key:generate`
3. **Instalar dependências**: `composer install` e `npm install`

---

## 🌐 Opções de Deploy Gratuito

### Opção 1: Vercel (Frontend) + Railway (Backend) ⭐ RECOMENDADO

#### Frontend (React) - Vercel (Gratuito)

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Importe o repositório `Alusem/ferry-bot`
5. Configure:
   - **Root Directory**: `ferry-bot-simulador`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Adicione variável de ambiente:
   - `VITE_API_URL`: URL do backend (você vai criar depois)
7. Clique em "Deploy"

**Tempo**: ~2 minutos  
**URL**: `https://ferry-bot-simulador.vercel.app`

#### Backend (Laravel) - Railway (Gratuito com $5 crédito/mês)

1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione `Alusem/ferry-bot`
5. Configure:
   - **Root Directory**: `ferry-bot-api`
   - **Build Command**: `composer install --no-dev --optimize-autoloader`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`
6. Adicione variáveis de ambiente:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=(gere com: php artisan key:generate --show)
   DB_CONNECTION=sqlite
   DB_DATABASE=/tmp/database.sqlite
   ```
7. Adicione um serviço SQLite ou MySQL (Railway oferece MySQL gratuito)

**Tempo**: ~5 minutos  
**URL**: `https://ferry-bot-api.railway.app`

---

### Opção 2: Render.com (Ambos) 🆓 TOTALMENTE GRATUITO

#### Backend (Laravel)

1. Acesse: https://render.com
2. Faça login com GitHub
3. Clique em "New" → "Web Service"
4. Conecte o repositório `Alusem/ferry-bot`
5. Configure:
   - **Name**: `ferry-bot-api`
   - **Root Directory**: `ferry-bot-api`
   - **Environment**: PHP
   - **Build Command**: `composer install --no-dev --optimize-autoloader && php artisan key:generate`
   - **Start Command**: `php -S 0.0.0.0:$PORT -t public`
6. Adicione variáveis de ambiente (mesmas do Railway)
7. Adicione PostgreSQL (gratuito no Render)

**Tempo**: ~10 minutos  
**URL**: `https://ferry-bot-api.onrender.com`

#### Frontend (React)

1. No Render, clique em "New" → "Static Site"
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `ferry-bot-simulador`
   - **Root Directory**: `ferry-bot-simulador`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Adicione variável de ambiente:
   - `VITE_API_URL`: URL do backend Render

**Tempo**: ~5 minutos  
**URL**: `https://ferry-bot-simulador.onrender.com`

---

### Opção 3: Fly.io (Backend) + Netlify (Frontend)

#### Backend - Fly.io

1. Instale Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/
2. Execute:
   ```bash
   cd ferry-bot-api
   fly launch
   ```
3. Siga as instruções

#### Frontend - Netlify

1. Acesse: https://netlify.com
2. "Add new site" → "Import from Git"
3. Configure similar ao Vercel

---

## 🔧 Configurações Importantes

### Backend - CORS

Certifique-se de que `config/cors.php` permite o domínio do frontend:

```php
'allowed_origins' => [
    'https://ferry-bot-simulador.vercel.app',
    'http://localhost:5173', // Para desenvolvimento
],
```

### Frontend - API URL

No `ferry-bot-simulador/src/services/api.js`, atualize:

```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'https://ferry-bot-api.railway.app/api/v1'
});
```

---

## 📝 Checklist de Deploy

- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] CORS configurado no backend
- [ ] Variável `VITE_API_URL` configurada no frontend
- [ ] Banco de dados criado e migrado
- [ ] Usuário admin criado
- [ ] Testar login no frontend
- [ ] Testar todas as funcionalidades

---

## 🎯 Recomendação Final

**Para apresentação rápida**: Use **Vercel (frontend) + Railway (backend)**

- Mais rápido de configurar
- Interface mais simples
- Suporte excelente
- Documentação clara

**Tempo total estimado**: 15-20 minutos

---

## 🆘 Problemas Comuns

### Backend não inicia
- Verifique se `APP_KEY` está configurado
- Verifique se o banco de dados está acessível
- Veja os logs no painel da plataforma

### Frontend não conecta ao backend
- Verifique a URL da API
- Verifique CORS no backend
- Verifique se o backend está online

### Erro 500 no backend
- Verifique os logs
- Certifique-se de que as migrations foram executadas
- Verifique permissões de arquivo (storage/)

---

## 📞 Próximos Passos

1. Escolha uma opção de deploy
2. Siga os passos acima
3. Teste tudo funcionando
4. Pronto para apresentação! 🎉

