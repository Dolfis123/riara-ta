const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Pegawai = sequelize.define("pegawai", {
  ID_Pegawai: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Nama_Pegawai: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  Jabatan: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  PIN: {
    type: DataTypes.STRING(255), // hashed PIN
    allowNull: false
  },
  Tanggal_Tambah: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  Role: {
    type: DataTypes.ENUM('super_admin', 'admin', 'pegawai'),
    defaultValue: 'pegawai'
  }
}, {
  timestamps: false,
  tableName: "pegawai"
});

module.exports = Pegawai;
