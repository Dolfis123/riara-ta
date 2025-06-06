const { RiwayatPengambilan, Barang, Pegawai } = require('../models');

// Controller untuk pengambilan barang
const pengambilanBarang = async (req, res) => {
  const { ID_Barang, Jumlah_Diambil, ID_Pegawai } = req.body;

  try {
    // Cek apakah barang ada
    const barang = await Barang.findByPk(ID_Barang);
    if (!barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    // Validasi stok
    if (barang.Stok_Tersedia <= 0) {
      return res.status(400).json({ message: 'Stok barang habis' });
    }

    if (Jumlah_Diambil > barang.Stok_Tersedia) {
      return res.status(400).json({ message: 'Jumlah diambil melebihi stok tersedia' });
    }

    // Kurangi stok barang
    barang.Stok_Tersedia -= Jumlah_Diambil;
    await barang.save();

    // Simpan riwayat pengambilan
    const riwayat = await RiwayatPengambilan.create({
      ID_Barang,
      ID_Pegawai,
      Jumlah_Diambil,
      Tanggal: new Date() // pastikan field 'Tanggal' ada di model
    });

    res.status(200).json({
      message: 'Pengambilan barang berhasil',
      riwayat
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
  }
};

// Controller untuk menampilkan riwayat pengambilan
const getRiwayatPengambilan = async (req, res) => {
  try {
    const riwayat = await RiwayatPengambilan.findAll({
      include: [
        {
          model: Barang,
          attributes: ['Nama_Barang']
        },
        {
          model: Pegawai,
          attributes: ['Nama_Pegawai']
        }
      ],
      order: [['Tanggal', 'DESC']]
    });

    res.status(200).json({ riwayat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data riwayat pengambilan.' });
  }
};


const { Op } = require('sequelize');

// Fungsi hitung jumlah barang diambil hari, bulan, tahun ini
function getJumlahBarangDiambil(req, res) {
  const now = new Date();

  // Hari ini
  const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const akhirHari = new Date(awalHari);
  akhirHari.setDate(akhirHari.getDate() + 1);

  // Bulan ini
  const awalBulan = new Date(now.getFullYear(), now.getMonth(), 1);
  const akhirBulan = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Tahun ini
  const awalTahun = new Date(now.getFullYear(), 0, 1);
  const akhirTahun = new Date(now.getFullYear() + 1, 0, 1);

  Promise.all([
    RiwayatPengambilan.sum('Jumlah_Diambil', {
      where: {
        Tanggal: {
          [Op.gte]: awalHari,
          [Op.lt]: akhirHari,
        },
      },
    }),
    RiwayatPengambilan.sum('Jumlah_Diambil', {
      where: {
        Tanggal: {
          [Op.gte]: awalBulan,
          [Op.lt]: akhirBulan,
        },
      },
    }),
    RiwayatPengambilan.sum('Jumlah_Diambil', {
      where: {
        Tanggal: {
          [Op.gte]: awalTahun,
          [Op.lt]: akhirTahun,
        },
      },
    }),
  ])
  .then(([hariIni, bulanIni, tahunIni]) => {
    res.status(200).json({
      hariIni: hariIni || 0,
      bulanIni: bulanIni || 0,
      tahunIni: tahunIni || 0,
    });
  })
  .catch((error) => {
    console.error('Gagal menghitung jumlah barang:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  });
}

// Dummy fungsi pengambilanBarang
function pengambilanBarang(req, res) {
  res.status(200).json({ message: 'Pengambilan barang berhasil' });
}

// Dummy fungsi getRiwayatPengambilan
function getRiwayatPengambilan(req, res) {
  // Contoh data riwayat
  res.status(200).json({ riwayat: [] });
}

module.exports = {
  pengambilanBarang,
  getJumlahBarangDiambil,
  getRiwayatPengambilan,
};
