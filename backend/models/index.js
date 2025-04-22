// models/index.js
const sequelize = require('../config/database'); // Mengimpor konfigurasi database
const { DataTypes } = require('sequelize');

// Import semua model
const Barang = require('./Barang'); // Tidak perlu pemanggilan (sequelize, DataTypes)
const Pegawai = require('./Pegawai'); // Sama untuk Pegawai dan RiwayatPengambilan
const RiwayatPengambilan = require('./RiwayatPengambilan');

// Relasi antar model
Barang.hasMany(RiwayatPengambilan, { foreignKey: 'ID_Barang' });
RiwayatPengambilan.belongsTo(Barang, { foreignKey: 'ID_Barang' });

Pegawai.hasMany(RiwayatPengambilan, { foreignKey: 'ID_Pegawai' });
RiwayatPengambilan.belongsTo(Pegawai, { foreignKey: 'ID_Pegawai' });

// Export semua model dan instance sequelize
module.exports = {
  sequelize,
  Barang,
  Pegawai,
  RiwayatPengambilan,
};
