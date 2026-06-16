require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const sequelize = require("./config/database");
const path = require('path');

// Import Models untuk sinkronisasi relasi yang benar
const { Pegawai, Barang, RiwayatPengambilan } = require('./models'); 

const barangRoutes = require('./routes/barang.routes');
const riwayatPengambilanRoutes = require('./routes/riwayatPengambilan.routes');
const authRoutes = require('./routes/auth.routes');
const pegawaiRoutes = require('./routes/pegawai.routes');
const pengambilanRoutes = require('./routes/pengambilan.routes');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(express.json());

app.use(
    session({
        secret: "secretkey", 
        resave: false,
        saveUninitialized: true,
    })
);

// PERBAIKAN CORS: Menambahkan port 3003 (Frontend Docker) agar tidak block login/transaksi
app.use(
    cors({
        origin: [
            'http://localhost:5173', 
            'http://localhost:3003', 
            'https://inventaris.pengadilannegerimanokwari.cloud'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Serve static files (QR Code images)
app.use('/api/qris', express.static(path.join(__dirname, 'public', 'qris')));

// =====================================================================
// --- PERBAIKAN ROUTING UNTUK MENGATASI ERROR 404 PENGAMBILAN BARANG ---
// =====================================================================
app.use('/api/barang', barangRoutes); 

// Mengubah mounting /api/pengambilan menjadi /api/barang
// Di dalam pengambilanRoutes terdapat router.post('/pengambilan')
// Sehingga gabungannya menjadi: /api/barang/pengambilan (Sesuai dengan Axios Frontend)
app.use('/api/barang', pengambilanRoutes); 

app.use('/api/riwayat', riwayatPengambilanRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/pegawai", pegawaiRoutes);
// =====================================================================

// --- FUNGSI: Membuat Super Admin Default Otomatis ---
const createDefaultAdmin = async () => {
    try {
        const adminExists = await Pegawai.findOne({ where: { Role: 'super_admin' } });
        
        if (!adminExists) {
            const hashedPin = await bcrypt.hash('123456', 10); 
            
            await Pegawai.create({
                Nama_Pegawai: 'admin',
                Jabatan: 'Administrator',
                PIN: hashedPin, 
                Role: 'super_admin'
            });
            console.log("✅ Akun Super Admin default berhasil dibuat! (PIN: 123456)");
        } else {
            console.log("ℹ️ Akun Super Admin sudah ada. Melewati proses pembuatan.");
        }
    } catch (error) {
        console.error("❌ Gagal membuat akun Super Admin default:", error);
    }
};

// Koneksi ke Database dan Sinkronisasi
sequelize
    .authenticate()
    .then(() => {
        console.log("Database connected...");
        return sequelize.sync(); 
    })
    .then(async () => {
        console.log("Sinkronisasi tabel selesai.");
        await createDefaultAdmin(); 
    })
    .catch((err) => console.log("Error: " + err));

// Set PORT
const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});