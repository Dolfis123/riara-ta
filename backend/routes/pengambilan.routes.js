const express = require('express');
const router = express.Router();
const pengambilanController = require('../controllers/pengambilanController');

// =====================================================================
// ROUTE PENGAMBILAN BARANG
// Base path di server.js: /api/barang
// =====================================================================

// 1. POST: Endpoint untuk memproses transaksi pengambilan barang
// URL Akhir yang terbentuk: POST /api/barang/pengambilan
router.post('/pengambilan', pengambilanController.pengambilanBarang);

// 2. GET: Endpoint untuk mengambil semua data riwayat pengambilan
// URL Akhir yang terbentuk: GET /api/barang/pengambilan
router.get('/pengambilan', pengambilanController.getRiwayatPengambilan);

module.exports = router;