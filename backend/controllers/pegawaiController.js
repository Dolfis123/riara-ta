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
        // 1. Dukung berbagai nama variabel dari frontend (Nama_Pegawai atau username, PIN atau password)
        const namaInput = req.body.Nama_Pegawai || req.body.username;
        const pinInput = req.body.PIN || req.body.pin || req.body.password;

        if (!namaInput || !pinInput) {
            return res.status(400).json({ message: "Username dan PIN harus diisi" });
        }

        // 2. Cari Pegawai
        const pegawai = await Pegawai.findOne({ where: { Nama_Pegawai: namaInput } });
        if (!pegawai) return res.status(404).json({ message: "Pegawai tidak ditemukan" });

        // 3. Cocokkan PIN menggunakan bcrypt
        const isMatch = await bcrypt.compare(String(pinInput), pegawai.PIN);
        if (!isMatch) return res.status(401).json({ message: "PIN salah" });

        // 4. Buat Token JWT
        const token = jwt.sign(
            { id: pegawai.ID_Pegawai, role: pegawai.Role },
            process.env.JWT_SECRET, 
            { expiresIn: "100m" }
        );

        res.status(200).json({
            message: "Login berhasil",
            token,
            role: pegawai.Role,
            username: pegawai.Nama_Pegawai,
            ID_Pegawai: pegawai.ID_Pegawai
        });
    } catch (error) {
        console.error("Error saat login:", error);
        res.status(500).json({ error: "Server error, silakan coba lagi nanti." });
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