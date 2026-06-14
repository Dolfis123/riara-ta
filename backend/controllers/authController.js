const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pegawai } = require('../models'); // Pastikan path model benar

const login = async (req, res) => {
  try {
      // 1. Tangkap data dari frontend (Mendukung berbagai nama variabel)
      const nama = req.body.username || req.body.Nama_Pegawai;
      const pinInput = req.body.password || req.body.pin || req.body.PIN;

      // 2. Validasi jika kosong
      if (!nama || !pinInput) {
          return res.status(400).json({ message: 'Username dan PIN harus diisi!' });
      }

      // 3. Cari pegawai berdasarkan Username/Nama
      const pegawai = await Pegawai.findOne({ 
          where: { Nama_Pegawai: nama } 
      });

      if (!pegawai) {
          return res.status(404).json({ message: 'User tidak ditemukan!' });
      }

      // 4. Cocokkan PIN (Karena saat ini PIN belum di-hash, kita pakai perbandingan teks biasa dulu)
      if (pegawai.PIN !== String(pinInput)) {
          return res.status(401).json({ message: 'PIN salah!' });
      }

      // 5. Buat Token JWT (Masa berlaku saya ubah jadi 1 hari agar tidak cepat logout)
      const token = jwt.sign(
          { id: pegawai.ID_Pegawai, role: pegawai.Role },
          process.env.JWT_SECRET,
          { expiresIn: '1d' } 
      );

      // 6. Kirim respon sukses
      res.status(200).json({ 
          message: 'Login berhasil!',
          token: token,
          role: pegawai.Role
      });

  } catch (error) {
      console.error("Error saat login:", error);
      // Tangkap error agar server tidak crash
      res.status(500).json({ message: 'Server error, silakan coba lagi nanti.' });
  }
};

module.exports = { login }; // Sesuaikan dengan cara export Anda