const { RiwayatPengambilan, Barang, Pegawai } = require('../models');

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

    // Generate QR Code baru setelah stok berkurang
    const qrFilename = `barang-${barang.ID_Barang}.png`;
    const qrPath = path.join(__dirname, '..', 'public', 'qris', qrFilename);

    // Pastikan folder public/qrcodes ada
    fs.mkdirSync(path.dirname(qrPath), { recursive: true });

    // Generate QR Code baru dengan stok yang terbaru
    await QRCode.toFile(qrPath, `${barang.ID_Barang}?stok=${barang.Stok_Tersedia}`, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
    });

    const qrUrl = `${req.protocol}://${req.get('host')}/api/qris/${qrFilename}`;
    barang.QR_Code = qrUrl;
    await barang.save();

    // Simpan riwayat pengambilan
    const riwayat = await RiwayatPengambilan.create({
      ID_Barang,
      ID_Pegawai,
      Jumlah_Diambil,
      Tanggal: new Date(), // pastikan field 'Tanggal' ada di model
    });

    res.status(200).json({
      message: 'Pengambilan barang berhasil',
      riwayat,
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

module.exports = {
  pengambilanBarang,
  getRiwayatPengambilan
};
