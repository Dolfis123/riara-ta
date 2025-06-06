// Pastikan kode ini ada di controller yang sudah ada
const Barang = require('../models/Barang');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

exports.scanBarang = async (req, res) => {
  try {
    const { id } = req.params;  // ID Barang yang dipindai
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.status(404).json({ message: 'Barang not found' });
    }

    // Tidak ada pengurangan stok pada saat scan
    // QR code tetap akan diupdate tanpa mengurangi stok

    const qrFilename = `barang-${barang.ID_Barang}.png`;
    const qrPath = path.join(__dirname, '..', 'public', 'qris', qrFilename);

    // Pastikan folder public/qris ada
    fs.mkdirSync(path.dirname(qrPath), { recursive: true });

    // Generate QR code yang mencerminkan stok terbaru
    await QRCode.toFile(qrPath, `${barang.ID_Barang}?stok=${barang.Stok_Tersedia}`, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
    });

    const qrUrl = `${req.protocol}://${req.get('host')}/api/qris/${qrFilename}`;
    barang.QR_Code = qrUrl;

    // Simpan perubahan QR code tanpa mengubah stok
    await barang.save();

    res.status(200).json({ message: 'QR Code updated successfully', data: barang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error scanning Barang', error });
  }
};

exports.createBarang = async (req, res) => {
  try {
    const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;

    // Step 1: Buat entri barang tanpa QR_Code dulu
    const newBarang = await Barang.create({
      Nama_Barang,
      Deskripsi,
      Stok_Tersedia,
      QR_Code: '', // placeholder sementara
    });

// Menghasilkan QR Code baru setelah stok berkurang
const qrFilename = `barang-${barang.ID_Barang}.png`;
const qrPath = path.join(__dirname, '..', 'public', 'qris', qrFilename);

// Pastikan folder public/qris ada
fs.mkdirSync(path.dirname(qrPath), { recursive: true });

// Generate QR code dengan stok terbaru
await QRCode.toFile(qrPath, `${barang.ID_Barang}?stok=${barang.Stok_Tersedia}`, {
  errorCorrectionLevel: 'H',
  type: 'png',
  width: 300,
});

const qrUrl = `${req.protocol}://${req.get('host')}/api/qris/${qrFilename}`;
barang.QR_Code = qrUrl;  // Memperbarui URL QR Code dengan yang baru
await barang.save();

    

    res.status(201).json({ message: 'Barang created successfully', data: newBarang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Barang', error });
  }
};


// Read All Barang
exports.getAllBarang = async (req, res) => {
    try {
        const barangList = await Barang.findAll();
        res.status(200).json(barangList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Barang', error });
    }
};

// Read Single Barang
exports.getBarangById = async (req, res) => {
    try {
        const { id } = req.params;
        const barang = await Barang.findByPk(id);
        if (!barang) {
            return res.status(404).json({ message: 'Barang not found' });
        }
        res.status(200).json(barang);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching Barang', error });
    }
};

// Update Barang
// Update Barang
exports.updateBarang = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;
        const barang = await Barang.findByPk(id);

        if (!barang) {
            return res.status(404).json({ message: 'Barang not found' });
        }

        barang.Nama_Barang = Nama_Barang || barang.Nama_Barang;
        barang.Deskripsi = Deskripsi || barang.Deskripsi;
        barang.Stok_Tersedia = Stok_Tersedia || barang.Stok_Tersedia;

        // Generate QR Code baru berdasarkan Stok_Tersedia terbaru
        const qrFilename = `barang-${barang.ID_Barang}.png`;
        const qrPath = path.join(__dirname, '..', 'public', 'qris', qrFilename);

        // Pastikan folder public/qrcodes ada
        fs.mkdirSync(path.dirname(qrPath), { recursive: true });

        // Generate QR code yang mencakup stok barang terbaru
        await QRCode.toFile(qrPath, `${barang.ID_Barang}?stok=${barang.Stok_Tersedia}`, {
          errorCorrectionLevel: 'H',
          type: 'png',
          width: 300,
        });

        const qrUrl = `${req.protocol}://${req.get('host')}/api/qris/${qrFilename}`;
        barang.QR_Code = qrUrl;

        await barang.save();

        res.status(200).json({ message: 'Barang updated successfully', data: barang });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating Barang', error });
    }
};

// Delete Barang
exports.deleteBarang = async (req, res) => {
    try {
        const { id } = req.params;
        const barang = await Barang.findByPk(id);

        if (!barang) {
            return res.status(404).json({ message: 'Barang not found' });
        }

        await barang.destroy();
        res.status(200).json({ message: 'Barang deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting Barang', error });
    }
};
const { Op } = require('sequelize');

exports.searchBarangByNama = async (req, res) => {
  try {
    const { nama } = req.query;

    if (!nama) {
      return res.status(400).json({ message: 'Parameter nama is required' });
    }

    const barangList = await Barang.findAll({
      where: {
        Nama_Barang: {
          [Op.like]: `%${nama}%`, // pencarian mengandung kata kunci
        },
      },
    });

    res.status(200).json(barangList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching Barang', error });
  }
};