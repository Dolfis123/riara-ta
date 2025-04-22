const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/qris'); // Menyimpan file di folder public/qris
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Menambahkan timestamp untuk memastikan nama unik
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Menyimpan file dengan nama unik
    }
});

// Filter untuk hanya menerima file gambar
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/; // Hanya menerima file gambar
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: File must be an image (jpeg, jpg, png)');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Maksimum ukuran file 5MB
});

module.exports = upload;
