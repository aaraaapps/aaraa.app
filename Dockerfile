# ---------- Build frontend ----------
FROM node:18-alpine AS frontend

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Run backend ----------
FROM node:18-alpine

WORKDIR /app

COPY --from=frontend /app/dist ./dist
COPY server.js .
COPY services ./services
COPY package*.json ./

RUN npm install --production

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
