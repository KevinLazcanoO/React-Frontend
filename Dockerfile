# --- Etapa 1: build ---
# Compilamos la app con Node y generamos los estáticos de producción (carpeta dist/).
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos primero los manifiestos para aprovechar la caché de capas de Docker:
# si package*.json no cambia, no se reinstalan dependencias.
COPY package*.json ./
RUN npm ci

# Copiamos el resto del código y construimos.
COPY . .
RUN npm run build

# --- Etapa 2: runtime ---
# Servimos los estáticos con nginx (imagen mínima, sin Node en producción).
FROM nginx:1.27-alpine AS runtime

# Config de nginx con fallback a index.html (necesario para el enrutado de la SPA).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el build generado en la etapa anterior.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
