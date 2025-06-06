// routes.js
const express = require('express');
const router = express.Router();
const pengambilanController = require('./../controllers/pengambilanController');
const statistikController = require('../controllers/pengambilanController');

// Route untuk pengambilan barang
router.post('/pengambilan', pengambilanController.pengambilanBarang);
// Route untuk jumlah barang yang diambil hari, bulan, dan tahun ini
router.get('/pengambilan/statistik', statistikController.getJumlahBarangDiambil);

// Route untuk get semua riwayat pengambilan
router.get('/pengambilan', pengambilanController.getRiwayatPengambilan);
module.exports = router;
