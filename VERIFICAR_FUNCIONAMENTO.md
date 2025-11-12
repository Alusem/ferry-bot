# ✅ Como Verificar se Está Funcionando

## 1️⃣ Conectar Postgres ao ferry-bot

### No modal "Connect to Postgres":
1. Clique na aba **"Private Network"** (não Public - evita custos)
2. Copie a **Connection URL** (ou use `{{ Postgres.DATABASE_URL }}`)
3. Feche o modal (X no canto superior direito)

### No serviço ferry-bot:
1. Clique no serviço **"ferry-bot"** (não no Postgres)
2. Vá na aba **"Variables"**
3. Clique em **"+ New Variable"**
4. Adicione:
   - **Name**: `DATABASE_URL`
   - **Value**: Cole a Connection URL do Postgres (ou use `{{ Postgres.DATABASE_URL }}`)
5. **Salve**

### Atualizar variáveis de ambiente:
No ferry-bot → Variables, certifique-se de ter:
- `DB_CONNECTION=pgsql` (ou `postgresql`)
- `DATABASE_URL` = (a URL que você copiou)

---

## 2️⃣ Verificar Deploy do ferry-bot

1. No serviço **"ferry-bot"**, vá na aba **"Deployments"**
2. Verifique se há um deploy com status **"Active"** ou **"Success"**
3. Se houver erro, clique em **"View logs"** para ver o que aconteceu

---

## 3️⃣ Verificar Pre-deploy

1. No serviço **"ferry-bot"**, vá em **Settings** → **Deploy**
2. Verifique se o **Pre-deploy Command** está:
   ```
   php artisan migrate --force && php artisan db:seed
   ```
3. Se não estiver, adicione e faça um novo deploy

---

## 4️⃣ Expor o Serviço (Criar URL Pública)

1. No serviço **"ferry-bot"**, vá em **Settings** → **Networking**
2. Clique em **"Generate Domain"** ou **"Public Networking"**
3. Isso cria uma URL pública tipo: `https://ferry-bot-xxxxx.railway.app`
4. **Copie essa URL** - você vai precisar dela!

---

## 5️⃣ Testar a API

Depois de expor o serviço, teste no navegador:

1. Acesse: `https://SUA-URL.railway.app/api/v1/public/vessels`
2. Deve retornar JSON com as embarcações
3. Se retornar JSON, está funcionando! ✅

---

## 6️⃣ Verificar se Usuário Admin Foi Criado

**Via API (depois de expor):**
- Tente fazer login via API ou frontend
- Email: `admin@ferry.bot`
- Senha: `12345678`

**Via Logs:**
- Vá em **Deployments** → **View logs**
- Procure por mensagens do seeder: "Usuário admin criado com sucesso!"

---

## 🎯 Checklist:

- [ ] Postgres conectado ao ferry-bot (DATABASE_URL configurada)
- [ ] Deploy do ferry-bot com sucesso
- [ ] Pre-deploy configurado
- [ ] Serviço exposto (URL pública criada)
- [ ] API respondendo (teste no navegador)
- [ ] Usuário admin criado (teste login)

---

## 🚨 Se algo não funcionar:

1. Verifique os **logs** em Deployments → View logs
2. Verifique as **variáveis de ambiente** em Variables
3. Verifique se o **Pre-deploy** executou corretamente
4. Me avise qual erro aparece!

