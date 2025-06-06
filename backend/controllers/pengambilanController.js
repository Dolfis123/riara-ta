const { RiwayatPengambilan, Barang, Pegawai } = require('../models');
const { Op } = require('sequelize');

// Fungsi untuk menghitung pengambilan berdasarkan waktu
const getStatistikPengambilan = async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

    // Custom date range dari query (opsional)
    const { startDate, endDate } = req.query;
    let customRangeFilter = {};

    if (startDate && endDate) {
      customRangeFilter = {
        Tanggal: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    const todayCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfToday, endOfToday]
        }
      }
    });

    const monthCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    const yearCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfYear, endOfYear]
        }
      }
    });

    const customRangeCount = Object.keys(customRangeFilter).length > 0
      ? await RiwayatPengambilan.count({ where: customRangeFilter })
      : null;

    res.status(200).json({
      hari_ini: todayCount,
      bulan_ini: monthCount,
      tahun_ini: yearCount,
      range_custom: customRangeCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data statistik.' });
  }
};

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
const getStatistikByDate = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({ message: 'Tanggal tidak boleh kosong.' });
    }

    const selectedDate = new Date(tanggal);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const startOfYear = new Date(selectedDate.getFullYear(), 0, 1);
    const endOfYear = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);

    const dayCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfDay, endOfDay]
        }
      }
    });

    const monthCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    });

    const yearCount = await RiwayatPengambilan.count({
      where: {
        Tanggal: {
          [Op.between]: [startOfYear, endOfYear]
        }
      }
    });

    res.status(200).json({
      hari: dayCount,
      bulan: monthCount,
      tahun: yearCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data berdasarkan tanggal.' });
  }
};

module.exports = {
  pengambilanBarang,
  getRiwayatPengambilan,
  getStatistikPengambilan,
  getStatistikByDate
};
