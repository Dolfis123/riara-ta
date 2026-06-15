const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // Mengimpor konfigurasi Multer
const barangController = require('../controllers/barangController');

// Create Barang
router.post('/', upload.single('QR_Code'), barangController.createBarang);

// Get All Barang
router.get('/', barangController.getAllBarang);

// Get Barang by ID
router.get('/:id', barangController.getBarangById);

// Update Barang
router.put('/:id', upload.single('QR_Code'), barangController.updateBarang);

// Delete Barang
router.delete('/:id', barangController.deleteBarang);


router.get('/search', barangController.searchBarangByNama);

module.exports = router;