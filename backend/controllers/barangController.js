const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Barang = require('../models/barang');

exports.createBarang = async (req, res) => {
  try {
    const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;

    const uuid = uuidv4();
    const fileName = `${uuid}.png`;
    const qrPath = path.join(__dirname, '..', 'public', 'qris', fileName);

    await QRCode.toFile(qrPath, uuid);

    const newBarang = await Barang.create({
      Nama_Barang,
      Deskripsi,
      Stok_Tersedia,
      QR_Code: fileName,
    });

    const qrImageUrl = `${req.protocol}://${req.get('host')}/qris/${fileName}`;

    res.status(201).json({
      ...newBarang.toJSON(),
      qr_image_url: qrImageUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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