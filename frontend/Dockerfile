# --- TAHAP 1: Build React/Vite ---
FROM node:18-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Menangkap variabel dari docker-compose agar terbaca saat npm run build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Perintah build (menghasilkan folder /dist)
RUN npm run build

# --- TAHAP 2: Serve dengan Nginx ---
FROM nginx:stable-alpine as production-stage

# Hapus config default nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx custom kita (yang dibuat di langkah 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy hasil build React dari tahap 1 ke folder Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]