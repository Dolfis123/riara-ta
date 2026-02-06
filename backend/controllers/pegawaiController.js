const Pegawai = require("../models/Pegawai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async(req, res) => {
    try {
        const { Nama_Pegawai, Jabatan, PIN, Role } = req.body;
        const hashedPin = await bcrypt.hash(PIN, 10);
        if (!Nama_Pegawai || !PIN || !Role) {
            return res.status(400).json({ message: "Semua field harus diisi!" });
        }
        const newPegawai = await Pegawai.create({
            Nama_Pegawai,
            Jabatan,
            PIN: hashedPin,
            Role
        });

        res.status(201).json({ message: "Registrasi berhasil", data: newPegawai });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async(req, res) => {
    try {
        const { Nama_Pegawai, PIN } = req.body;
        const pegawai = await Pegawai.findOne({ where: { Nama_Pegawai } });

        if (!pegawai) return res.status(404).json({ message: "Pegawai tidak ditemukan" });

        const isMatch = await bcrypt.compare(PIN, pegawai.PIN);
        if (!isMatch) return res.status(401).json({ message: "PIN salah" });

        const token = jwt.sign({ id: pegawai.ID_Pegawai, role: pegawai.Role },
            process.env.JWT_SECRET, { expiresIn: "100m" }
        );

        res.status(200).json({
            message: "Login berhasil",
            token,
            role: pegawai.Role,
            username: pegawai.Nama_Pegawai,
            ID_Pegawai: pegawai.ID_Pegawai
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAll = async(req, res) => {
    try {
        const pegawai = await Pegawai.findAll();
        res.status(200).json(pegawai);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async(req, res) => {
    try {
        const { id } = req.params;
        const { Nama_Pegawai, Jabatan, PIN, Role } = req.body;

        const updateData = { Nama_Pegawai, Jabatan, Role };
        if (PIN) updateData.PIN = await bcrypt.hash(PIN, 10);

        await Pegawai.update(updateData, { where: { ID_Pegawai: id } });

        res.status(200).json({ message: "Pegawai berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const remove = async(req, res) => {
    try {
        const { id } = req.params;
        await Pegawai.destroy({ where: { ID_Pegawai: id } });
        res.status(200).json({ message: "Pegawai berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Fungsi baru untuk mengambil hanya pegawai dengan role 'pegawai'
const getAllPegawaiOnly = async(req, res) => {
    try {
        const pegawai = await Pegawai.findAll({
            where: { Role: 'pegawai' }
        });
        res.status(200).json(pegawai);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const countByRole = async(req, res) => {
    try {
        const countPegawai = await Pegawai.count({ where: { Role: 'pegawai' } });
        const countAdmin = await Pegawai.count({ where: { Role: 'admin' } });

        res.status(200).json({
            totalPegawai: countPegawai,
            totalAdmin: countAdmin
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



module.exports = { register, login, getAll, getAllPegawaiOnly, update, remove, countByRole };