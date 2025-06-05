const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Barang = db.define('barang', {
  ID_Barang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  Tanggal_Tambah: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: db.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'barang',
  timestamps: false,
});

module.exports = Barang;
