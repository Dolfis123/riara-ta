const moment = require('moment-timezone');
const { RiwayatPengambilan, Barang, Pegawai } = require('../models');
const { Op } = require('sequelize'); // ✅ hanya sekali di sini

// Fungsi untuk menghitung pengambilan berdasarkan waktu (sesuaikan timezone WIT)
const getStatistikPengambilan = async (req, res) => {
  try {
    const nowWIT = moment().tz('Asia/Jayapura');

    const startOfToday = nowWIT.clone().startOf('day').toDate();
    const endOfToday = nowWIT.clone().endOf('day').toDate();

    const startOfMonth = nowWIT.clone().startOf('month').toDate();
    const endOfMonth = nowWIT.clone().endOf('month').toDate();

    const startOfYear = nowWIT.clone().startOf('year').toDate();
    const endOfYear = nowWIT.clone().endOf('year').toDate();

    // Custom date range dari query (opsional)
    const { startDate, endDate } = req.query;
    let customRangeFilter = {};

    if (startDate && endDate) {
      // Pastikan juga timezone-nya WIT
      const startCustom = moment.tz(startDate, 'Asia/Jayapura').startOf('day').toDate();
      const endCustom = moment.tz(endDate, 'Asia/Jayapura').endOf('day').toDate();

      customRangeFilter = {
        Tanggal: {
          [Op.between]: [startCustom, endCustom]
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

// Controller untuk pengambilan barang (simpan waktu pakai WIT)
const pengambilanBarang = async (req, res) => {
  const { ID_Barang, Jumlah_Diambil, ID_Pegawai } = req.body;

  try {
    const barang = await Barang.findByPk(ID_Barang);
    if (!barang) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (barang.Stok_Tersedia <= 0) {
      return res.status(400).json({ message: 'Stok barang habis' });
    }

    if (Jumlah_Diambil > barang.Stok_Tersedia) {
      return res.status(400).json({ message: 'Jumlah diambil melebihi stok tersedia' });
    }

    barang.Stok_Tersedia -= Jumlah_Diambil;
    await barang.save();

    // Simpan waktu saat ini dengan timezone WIT
    // const waktuWIT = moment().tz('Asia/Jayapura').toDate();
const dateUTC = new Date();
const dateWIT = new Date(dateUTC.getTime() + 9 * 60 * 60 * 1000);

const riwayat = await RiwayatPengambilan.create({
  ID_Barang,
  ID_Pegawai,
  Jumlah_Diambil,
  Tanggal: dateWIT
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

// Fungsi getStatistikByDate juga disesuaikan timezone WIT
const getStatistikByDate = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({ message: 'Tanggal tidak boleh kosong.' });
    }

    // Parsing tanggal input sesuai WIT
    const startOfDay = moment.tz(tanggal, 'YYYY-MM-DD', 'Asia/Jayapura').startOf('day').toDate();
    const endOfDay = moment.tz(tanggal, 'YYYY-MM-DD', 'Asia/Jayapura').endOf('day').toDate();

    const year = moment(tanggal).year();
    const month = moment(tanggal).month();

    const startOfMonth = moment.tz([year, month], 'Asia/Jayapura').startOf('month').toDate();
    const endOfMonth = moment.tz([year, month], 'Asia/Jayapura').endOf('month').toDate();

    const startOfYear = moment.tz([year], 'Asia/Jayapura').startOf('year').toDate();
    const endOfYear = moment.tz([year], 'Asia/Jayapura').endOf('year').toDate();

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
module.exports = {
  pengambilanBarang,
  getRiwayatPengambilan,
  getStatistikPengambilan,
  getStatistikByDate
};
