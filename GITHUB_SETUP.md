# 🚀 Como Fazer Push para o GitHub

## Passo 1: Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository"
3. Nome sugerido: `ferry-bot` ou `ferry-bot-sistema`
4. **NÃO** marque "Initialize with README" (já temos um)
5. Clique em "Create repository"

## Passo 2: Conectar e Fazer Push

Execute os seguintes comandos no terminal (na pasta raiz do projeto):

```bash
# Adicionar o repositório remoto (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/ferry-bot.git

# Ou se preferir SSH:
# git remote add origin git@github.com:SEU_USUARIO/ferry-bot.git

# Verificar se foi adicionado
git remote -v

# Fazer push do código
git branch -M main
git push -u origin main
```

## Passo 3: Verificar

Acesse seu repositório no GitHub e verifique se todos os arquivos foram enviados.

## 📝 Nota

O `.gitignore` já está configurado para ignorar:
- `node_modules/`
- `vendor/`
- `.env`
- `database/database.sqlite`
- Pastas de projetos antigos

Apenas os arquivos necessários serão enviados!

