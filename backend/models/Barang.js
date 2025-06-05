const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Barang = db.define('Barang', {
  ID_Barang: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Nama_Barang: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  Deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Stok_Tersedia: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  QR_Code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  Tanggal_Tambah: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'barang',
  timestamps: false,
});

module.exports = Barang;
