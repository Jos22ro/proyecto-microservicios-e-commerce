# Etapa de construcción - USAR NODE 20
FROM node:20-alpine as build-stage

WORKDIR /app

# Copiar archivos de package
COPY package*.json ./
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine as production-stage

# Copiar los archivos construidos a nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]