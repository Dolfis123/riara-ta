require("dotenv").config(); // Pastikan baris ini ada di paling atas
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST, // Ini akan membaca 'inventaris_db' dari docker-compose
    dialect: "mysql",
    logging: false, // Opsional: Matikan log SQL biar terminal bersih
  }
);

module.exports = sequelize;