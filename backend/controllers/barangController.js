const Barang = require("../models/Barang");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize"); // [PENTING] Tambahkan import Op

// controllers/barangController.js
exports.createBarang = async (req, res) => {
  try {
    const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;

    // --- VALIDASI DUPLIKAT (TAMBAHAN BARU) ---
    // Cek apakah nama barang sudah ada di database
    const existingBarang = await Barang.findOne({
      where: { Nama_Barang: Nama_Barang },
    });

    if (existingBarang) {
      return res.status(400).json({
        message: "Nama barang sudah terdaftar. Gunakan nama lain.",
      });
    }
    // ------------------------------------------

    // 1. Buat data dulu (QR Code sementara kosong)
    const newBarang = await Barang.create({
      Nama_Barang,
      Deskripsi,
      Stok_Tersedia,
      QR_Code: "",
    });

    // 2. Generate Nama File
    const qrFilename = `barang-${newBarang.ID_Barang}.png`;

    // Path folder di server
    const qrPath = path.join(__dirname, "..", "public", "qris", qrFilename);

    // Pastikan folder ada
    fs.mkdirSync(path.dirname(qrPath), { recursive: true });

    // 3. Buat File QR Code
    await QRCode.toFile(qrPath, String(newBarang.ID_Barang), {
      errorCorrectionLevel: "H",
      type: "png",
      width: 300,
    });

    // Update record dengan nama file QR
    newBarang.QR_Code = qrFilename;
    await newBarang.save();

    res
      .status(201)
      .json({ message: "Barang created successfully", data: newBarang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating Barang", error });
  }
};

// Read All Barang
exports.getAllBarang = async (req, res) => {
  try {
    const barangList = await Barang.findAll();
    res.status(200).json(barangList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching Barang", error });
  }
};

// Read Single Barang
exports.getBarangById = async (req, res) => {
  try {
    const { id } = req.params;
    const barang = await Barang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }
    res.status(200).json(barang);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching Barang", error });
  }
};

// Update Barang
exports.updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nama_Barang, Deskripsi, Stok_Tersedia } = req.body;
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    // --- VALIDASI DUPLIKAT UNTUK UPDATE (TAMBAHAN BARU) ---
    // Jika user mengubah nama barang, cek apakah nama baru itu sudah dipakai barang lain
    if (Nama_Barang && Nama_Barang !== barang.Nama_Barang) {
      const existingBarang = await Barang.findOne({
        where: {
          Nama_Barang: Nama_Barang,
          ID_Barang: { [Op.ne]: id }, // Cek nama sama TAPI bukan ID barang ini sendiri
        },
      });

      if (existingBarang) {
        return res.status(400).json({
          message: "Nama barang sudah terdaftar pada item lain.",
        });
      }
    }
    // -------------------------------------------------------

    barang.Nama_Barang = Nama_Barang || barang.Nama_Barang;
    barang.Deskripsi = Deskripsi || barang.Deskripsi;
    barang.Stok_Tersedia = Stok_Tersedia || barang.Stok_Tersedia;

    // Jika ada QR Code baru yang di-upload
    if (req.file) {
      barang.QR_Code = req.file.filename;
    }

    await barang.save();

    res
      .status(200)
      .json({ message: "Barang updated successfully", data: barang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating Barang", error });
  }
};

// Delete Barang
exports.deleteBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    await barang.destroy();
    res.status(200).json({ message: "Barang deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting Barang", error });
  }
};
const { Op } = require("sequelize");

exports.searchBarangByNama = async (req, res) => {
  try {
    const { nama } = req.query;

    if (!nama) {
      return res.status(400).json({ message: "Parameter nama is required" });
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
    res.status(500).json({ message: "Error searching Barang", error });
  }
};
