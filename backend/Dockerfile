FROM node:18-alpine

WORKDIR /app

# Copy daftar dependensi
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy seluruh kode backend
COPY . .

# Buat folder public/qris agar tidak error saat start (jaga-jaga)
RUN mkdir -p public/qris

# Buka port 7070 sesuai kode Anda
EXPOSE 7070

# Jalankan server
CMD ["node", "server.js"]