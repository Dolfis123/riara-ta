const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Mengimpor konfigurasi Multer
const barangController = require('../controllers/barangController');

// Create Barang
router.post('/barang', upload.single('QR_Code'), barangController.createBarang);

// Get All Barang
router.get('/barang', barangController.getAllBarang);

// Get Barang by ID
router.get('/barang/:id', barangController.getBarangById);

// Update Barang
router.put('/barang/:id', upload.single('QR_Code'), barangController.updateBarang);

// Delete Barang
router.delete('/barang/:id', barangController.deleteBarang);

// Pencarian Barang berdasarkan Nama
router.get('/search', barangController.searchBarangByNama);

// **Route baru untuk menangani pemindaian QR Code dan mengurangi stok**
router.post('/barang/scan/:id', barangController.scanBarang); // Scan untuk memperbarui stok dan QR Code

module.exports = router;
