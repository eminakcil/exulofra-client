# Build aşaması
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production aşaması (Nginx)
FROM socialengine/nginx-spa:latest
COPY --from=build-stage /app/dist /app
RUN chmod -R 777 /app

EXPOSE 80