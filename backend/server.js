require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/database");
const path = require('path');
const barangRoutes = require('./routes/barang.routes');
// const pegawaiRoutes = require('./routes/pegawai.routes');
const riwayatPengambilanRoutes = require('./routes/riwayatPengambilan.routes');
const authRoutes = require('./routes/auth.routes');
const pegawaiRoutes = require('./routes/pegawai.routes');
const pengambilanRoutes = require('./routes/pengambilan.routes');
const app = express();

// Middleware
app.use(express.json()); // Ini sudah cukup untuk menangani JSON body request

app.use(
  session({
    secret: "secretkey", // Ganti dengan secret yang lebih aman
    resave: false,
    saveUninitialized: true,
  })
);

app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = ['https://skydance.life', 'https://www.skydance.life', 'http://localhost:5173'];
      
      // Jika request tidak punya origin (misal Postman atau server-to-server), kita izinkan juga (opsional)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Serve static files (QR Code images)
app.use('/public/qris', express.static(path.join(__dirname, 'public', 'qris')));

// PATH untuk menyimpan QR Code
app.use('/api', barangRoutes); // Rute untuk barang
// app.use('/api', pegawaiRoutes); // Rute untuk pegawai
app.use('/api/riwayat', riwayatPengambilanRoutes);  // Menambahkan riwayat pengambilan routes
app.use('/api/auth', authRoutes);
app.use("/api/pegawai", pegawaiRoutes);
app.use('/api/barang', pengambilanRoutes);
// Koneksi ke Database dan Sinkronisasi
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");

    // Sinkronisasi model dengan database
    return sequelize.sync(); // Sinkronisasi model ke database (buat tabel jika belum ada)
  })
  .then(() => {
    console.log("Sinkronisasi tabel selesai.");
  })
  .catch((err) => console.log("Error: " + err));

// Set PORT
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
