// models/Barang.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Mengimpor konfigurasi database

const Barang = sequelize.define('barang', {
    ID_Barang: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    Nama_Barang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    Stok_Tersedia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    QR_Code: {
        type: DataTypes.STRING(255),
        allowNull: true // ubah dari false ke true
      },
    Tanggal_Tambah: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'barang',
    timestamps: false // Karena kita sudah mengatur tanggal sendiri
});

module.exports = Barang;
