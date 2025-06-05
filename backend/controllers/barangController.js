const Barang = require('../models/Barang');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

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

    // Pastikan ID_Barang sudah ada
    if (!newBarang.ID_Barang) {
      throw new Error("ID_Barang tidak ditemukan setelah pembuatan barang");
    }

    // Step 2: Generate nama file QR Code menggunakan ID_Barang untuk memastikan keunikannya
    const qrFilename = `barang-${newBarang.ID_Barang}.png`;  // Menggunakan ID_Barang untuk memastikan file unik
    const qrPath = path.join(process.cwd(), 'public', 'qris', qrFilename);  // Path untuk menyimpan file QR code

    // Pastikan folder public/qris ada
    fs.mkdirSync(path.dirname(qrPath), { recursive: true });

    // Step 3: Buat QR Code yang menyimpan ID_Barang
    await QRCode.toFile(qrPath, String(newBarang.ID_Barang), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
    });

    // Step 4: Simpan path relatif file QR Code di database (tanpa domain)
    const qrRelativePath = `/qris/${qrFilename}`;  // Simpan path relatif QR Code
    newBarang.QR_Code = qrRelativePath;
    await newBarang.save();

    res.status(201).json({
      message: 'Barang created successfully',
      data: newBarang, // Pastikan newBarang berisi ID_Barang dan QR_Code
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating Barang', error });
  }
};


// Get all
exports.getAllBarang = async (req, res) => {
  try {
    const barang = await Barang.findAll();
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get by ID
exports.getBarangById = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });
    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Update
exports.updateBarang = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;

    await barang.update({
      Nama_Barang,
      Deskripsi,
      Stok_Tersedia,
    });

    res.json(barang);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
exports.deleteBarang = async (req, res) => {
  try {
    const barang = await Barang.findByPk(req.params.id);
    if (!barang) return res.status(404).json({ message: 'Barang tidak ditemukan' });

    await barang.destroy();
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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