# 🎯 Passo a Passo Final - O Que Fazer AGORA

## ❌ Problema Identificado:

O Postgres mostra "You have no tables" - isso significa:
1. O ferry-bot não está conectado ao Postgres
2. As migrations não foram executadas

## ✅ SOLUÇÃO - Faça NESTA ORDEM:

### 1️⃣ Conectar Postgres ao ferry-bot (CRÍTICO)

1. No Railway, clique no serviço **"ferry-bot"** (não no Postgres)
2. Vá na aba **"Variables"**
3. Verifique se existe `DATABASE_URL`
4. Se NÃO existir:
   - Clique em **"+ New Variable"**
   - **Name**: `DATABASE_URL`
   - **Value**: `{{ Postgres.DATABASE_URL }}`
   - Salve
5. Adicione também:
   - **Name**: `DB_CONNECTION`
   - **Value**: `pgsql`
   - Salve

### 2️⃣ Fazer Novo Deploy

Depois de adicionar as variáveis:
1. O Railway deve fazer deploy automático
2. Ou vá em **Deployments** → clique em **"Deploy"**
3. O Pre-deploy vai executar as migrations

### 3️⃣ Verificar se Funcionou

1. Volte no Postgres → **Database** → **Data**
2. Deve aparecer as tabelas: `users`, `vessels`, `trips`, `bookings`, `reports`
3. Se aparecer, está funcionando! ✅

### 4️⃣ Expor o Serviço

1. No ferry-bot, vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"**
3. Copie a URL gerada

### 5️⃣ Testar API

Acesse no navegador:
```
https://SUA-URL.railway.app/api/v1/public/vessels
```

Deve retornar JSON com as embarcações.

---

## 🚨 IMPORTANTE:

O Dockerfile foi atualizado para suportar PostgreSQL. Faça um novo deploy depois de adicionar as variáveis!

---

## 📋 Checklist:

- [ ] Adicionar `DATABASE_URL` no ferry-bot
- [ ] Adicionar `DB_CONNECTION=pgsql` no ferry-bot
- [ ] Fazer novo deploy
- [ ] Verificar tabelas no Postgres
- [ ] Expor serviço (gerar URL)
- [ ] Testar API

**Comece pelo passo 1 - conectar o Postgres!**

