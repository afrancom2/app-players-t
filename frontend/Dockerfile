# --- Etapa 1: build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production,docker

# --- Etapa 2: runtime (nginx sirviendo los archivos estáticos) ---
FROM nginx:alpine AS runtime
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
