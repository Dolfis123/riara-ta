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

const { Op, fn, col } = require('sequelize');

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
    RiwayatPengambilan.count({
      distinct: true,
      col: 'ID_Transaksi',
      where: {
        Tanggal: {
          [Op.gte]: awalHari,
          [Op.lt]: akhirHari,
        },
      },
    }),
    RiwayatPengambilan.count({
      distinct: true,
      col: 'ID_Transaksi',
      where: {
        Tanggal: {
          [Op.gte]: awalBulan,
          [Op.lt]: akhirBulan,
        },
      },
    }),
    RiwayatPengambilan.count({
      distinct: true,
      col: 'ID_Transaksi',
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
    console.error('Gagal menghitung jumlah transaksi:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  });
}

const { Op } = require('sequelize');
const RiwayatPengambilan = require('../models/riwayat_pengambilan'); // model anda

// API untuk statistik dengan filter tanggal dinamis
async function getStatistikByDateRange(req, res) {
  try {
    let { startDate, endDate } = req.query;

    // Jika tidak dikirim, default ke hari ini
    if (!startDate || !endDate) {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else {
      startDate = new Date(startDate);
      endDate = new Date(endDate);
    }

    // Hitung jumlah transaksi unik dalam rentang waktu
    const countTransaksi = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        }
      },
      distinct: true,
      col: 'ID_Transaksi'
    });

    res.json({ countTransaksi });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data statistik' });
  }
}



module.exports = {
  pengambilanBarang,
  getJumlahBarangDiambil,
  getRiwayatPengambilan,
  getStatistikByDateRange
};
