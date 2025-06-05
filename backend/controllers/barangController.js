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

    // Step 2: Generate nama file QR Code
    const qrFilename = `barang-${newBarang.ID_Barang}.png`;

const qrPath = path.join(process.cwd(), 'public', 'qris', qrFilename);

    // Pastikan folder public/qris ada
    fs.mkdirSync(path.dirname(qrPath), { recursive: true });

    // Step 3: Buat QR Code yang menyimpan ID_Barang
    await QRCode.toFile(qrPath, String(newBarang.ID_Barang), {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
    });

    // ✅ Gunakan domain tetap (bukan req.get('host'))
    const qrUrl = `https://skydance.life/qris/${qrFilename}`;
    newBarang.QR_Code = qrUrl;
    await newBarang.save();

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

        // Jika ada QR Code baru yang di-upload
        if (req.file) {
            barang.QR_Code = req.file.filename;
        }

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