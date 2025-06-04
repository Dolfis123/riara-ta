require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/database");
const path = require('path');
const barangRoutes = require('./routes/barang.routes');
const riwayatPengambilanRoutes = require('./routes/riwayatPengambilan.routes');
const authRoutes = require('./routes/auth.routes');
const pegawaiRoutes = require('./routes/pegawai.routes');
const pengambilanRoutes = require('./routes/pengambilan.routes');
const app = express();

// Base URL untuk domain produksi
const baseUrl = "https://skydance.life"; 

// Middleware untuk menangani JSON body request
app.use(express.json());

// Middleware untuk session
app.use(
  session({
    secret: "secretkey", // Ganti dengan secret yang lebih aman
    resave: false,
    saveUninitialized: true,
  })
);

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = ['https://skydance.life', 'https://www.skydance.life', 'http://localhost:5173'];
      
      if (!origin) return callback(null, true);  // Jika request tidak punya origin (misal Postman atau server-to-server), kita izinkan juga

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

// Endpoint untuk mengambil QR Code dengan barang ID
app.get('/api/barang/:id', (req, res) => {
  const barangId = req.params.id;  // Ambil ID barang dari parameter URL
  const qrCodeUrl = `${baseUrl}/public/qris/barang-${barangId}.png`;

  // Kirimkan URL gambar QR Code ke frontend
  res.json({ QR_Code: qrCodeUrl, Nama_Barang: "Barang XYZ" });
});

// Serve static files (QR Code images)
app.use('/public/qris', express.static(path.join(__dirname, 'public', 'qris')));

// API routes
app.use('/api', barangRoutes); // Rute untuk barang
app.use('/api/riwayat', riwayatPengambilanRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/pegawai", pegawaiRoutes);
app.use('/api/barang', pengambilanRoutes);

// Koneksi ke Database dan Sinkronisasi
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected...");
    return sequelize.sync(); // Sinkronisasi model ke database
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
