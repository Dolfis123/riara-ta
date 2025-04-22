const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Pegawai = require('../models/Pegawai'); // Pastikan Anda sudah mengimpor model Pegawai dengan benar

const login = async (req, res) => {
  const { PIN } = req.body;
  const pegawai = await Pegawai.findOne({ where: { PIN } });

  if (!pegawai) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: pegawai.ID_Pegawai, role: pegawai.Role },
    process.env.JWT_SECRET,
    { expiresIn: '10m' } // token expires in 10 minutes
  );

  res.json({ token });
};

module.exports = { login };
