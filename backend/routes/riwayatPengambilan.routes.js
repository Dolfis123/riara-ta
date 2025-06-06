// routes.js
const express = require('express');
const router = express.Router();
const pengambilanController = require('./../controllers/pengambilanController');

// Route untuk pengambilan barang
router.post('/pengambilan', pengambilanController.pengambilanBarang);
router.get('/pengambilan/statistik/by-date', pengambilanController.getStatistikByDate);

// Route untuk statistik pengambilan
router.get('/pengambilan/statistik', pengambilanController.getStatistikPengambilan);

// Route untuk get semua riwayat pengambilan
router.get('/pengambilan', pengambilanController.getRiwayatPengambilan);
module.exports = router;
