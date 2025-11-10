# Dockerfile
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app

# Copia package*.json primeiro para cache de camadas
COPY package*.json ./

# Instala dependências
RUN npm ci --silent

# (garante navegadores; a imagem já costuma trazer, mas fica seguro)
RUN npx playwright install --with-deps chromium

# Copia tudo
COPY . .

# Build da extensão em dist/
RUN node scripts/build-extension.mjs

# Comando default: rodar testes
CMD ["npm", "test:e2e"]
