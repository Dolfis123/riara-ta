// models/RiwayatPengambilan.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Mengimpor konfigurasi database

const RiwayatPengambilan = sequelize.define('riwayat_pengambilan', {
    ID_Transaksi: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_Barang: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ID_Pegawai: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Jumlah_Diambil: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Tanggal: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'riwayat_pengambilan',
    timestamps: false // Karena kita sudah mengatur tanggal sendiri
});

module.exports = RiwayatPengambilan;
