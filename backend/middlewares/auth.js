const jwt = require('jsonwebtoken');
const JWT_SECRET = 'yourSecretKey'; // Sama dengan yang digunakan di controller

// Middleware untuk memverifikasi JWT
exports.authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Verifikasi token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.pegawai = decoded; // Menyimpan data pegawai di request untuk digunakan di route
        next();
    } catch (err) {
        return res.status(400).json({ message: 'Token is not valid' });
    }
};