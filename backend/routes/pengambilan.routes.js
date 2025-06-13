// routes.js
const express = require('express');
const router = express.Router();
const pengambilanController = require('./../controllers/pengambilanController');

// Route untuk pengambilan barang
router.post('/pengambilan', pengambilanController.pengambilanBarang);
// Route untuk get semua riwayat pengambilan
router.get('/pengambilan', pengambilanController.getRiwayatPengambilan);
module.exports = router;
