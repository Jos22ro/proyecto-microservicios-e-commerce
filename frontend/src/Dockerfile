# Etapa de construcción
FROM node:18-alpine as build-stage

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

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]