const { Barang, RiwayatPengambilan } = require("../models");

exports.pengambilanBarang = async (req, res) => {
  const { ID_Barang, ID_Pegawai, Jumlah_Diambil } = req.body;

  try {
    const barang = await Barang.findByPk(ID_Barang);
    if (!barang) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    if (barang.Stok_Tersedia < Jumlah_Diambil) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    // Kurangi stok
    barang.Stok_Tersedia -= Jumlah_Diambil;
    await barang.save();

    // Simpan ke riwayat pengambilan
    await RiwayatPengambilan.create({
      ID_Barang,
      ID_Pegawai,
      Jumlah_Diambil,
    });

    res.status(200).json({ message: "Barang berhasil diambil" });
  } catch (error) {
    console.error("Gagal mengambil barang:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
