# ---- Base image ----
FROM node:20-alpine

# wget est utilisé par le healthcheck Docker (présent par défaut via busybox sur alpine)
WORKDIR /usr/src/app

# Installe les dépendances en premier pour profiter du cache de couches Docker
COPY package*.json ./
RUN npm install --omit=dev

# Copie le reste du code
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
