// backend/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const app = express();
const port = 5000;
const JWT_SECRET = 'ini-adalah-kunci-rahasia-yang-sangat-aman-dan-harus-diganti'; // Ganti dengan key rahasia Anda sendiri

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Endpoint Publik ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${req.body.nik}-${Date.now()}-${file.originalname}`)
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2 Megabytes
    }
});

app.post('/api/pengajuan', upload.fields([
    { name: 'file_ktp', maxCount: 1 }, { name: 'file_pernyataan', maxCount: 1 },
    { name: 'file_permohonan', maxCount: 1 }, { name: 'file_berkas_izin', maxCount: 1 },
    { name: 'file_denah_lokasi', maxCount: 1 }
]), (req, res) => {

	console.log("👉 [DEBUG] Request masuk ke /api/pengajuan");
    console.log("👉 [DEBUG] Body Data:", req.body);
    console.log("👉 [DEBUG] Files Data:", req.files ? Object.keys(req.files) : "Tidak ada file");

    const data = req.body;
    const files = req.files;

    // FUNGSI AMAN UNTUK MENGAMBIL NAMA FILE
    // Ini akan mengembalikan nama file jika ada, atau null jika tidak ada, tanpa menyebabkan error.
    const getFilename = (fieldName) => {
        if (files && files[fieldName] && files[fieldName][0]) {
            return files[fieldName][0].filename;
        }
        return null;
    };

    const sql = `INSERT INTO pengajuan (nama_lengkap, nik, alamat, nomor_whatsapp, jumlah_peserta, file_ktp, file_pernyataan, file_permohonan, file_berkas_izin, file_denah_lokasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        data.nama_lengkap,
        data.nik,
        data.alamat,
        data.nomor_whatsapp,
        data.jumlah_peserta,
        getFilename('file_ktp'),
        getFilename('file_pernyataan'),
        getFilename('file_permohonan'),
        getFilename('file_berkas_izin'),
        getFilename('file_denah_lokasi')
    ];

    // Cek apakah file yang wajib diunggah benar-benar ada
    if (!values[5] || !values[6] || !values[7] || !values[8] || !values[9]) {
        // Ganti angka di atas sesuai dengan file yang wajib. 
        // values[5] adalah file_ktp, values[6] adalah file_pernyataan, dst.
        console.error("Upload file tidak lengkap:", files);
        return res.status(400).send('Upload file tidak lengkap. Pastikan semua file yang wajib telah dipilih.');
    }

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("❌ [DEBUG] Error Database:", err.sqlMessage || err);
            return res.status(500).send('Server error saat menyimpan data.');
        }
	console.log("✅ [DEBUG] Berhasil simpan ke DB. ID:", result.insertId);
        res.status(201).send('Pengajuan berhasil dikirim');
    });
});

// --- Endpoint Otentikasi ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

	console.log(`👉 [LOGIN DEBUG] Mencoba login user: ${username}`);

    const sql = 'SELECT * FROM admins WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error("❌ [LOGIN ERROR] Database error:", err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            console.log("❌ [LOGIN FAILED] Username tidak ditemukan");
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        const admin = results[0];
        console.log("✅ [LOGIN FOUND] User ditemukan, memverifikasi password...");

        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (!isMatch) {
            console.log("❌ [LOGIN FAILED] Password Salah");
            return res.status(401).json({ message: 'Username atau password salah' });
        }

        console.log("✅ [LOGIN SUCCESS] Login Berhasil!");
        const payload = { id: admin.id, username: admin.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        res.json({ token });
    });
});

// --- Middleware untuk Proteksi Rute ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// --- Rute Admin yang Dilindungi ---
app.get('/api/pengajuan', verifyToken, (req, res) => {
    db.query('SELECT * FROM pengajuan ORDER BY tanggal_pengajuan DESC', (err, results) => {
        if (err) return res.status(500).send('Server error');
        res.json(results);
    });
});

app.put('/api/pengajuan/:id/status', verifyToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE pengajuan SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, result) => {
         if (err) return res.status(500).send('Server error');
         if (result.affectedRows === 0) return res.status(404).send('Pengajuan tidak ditemukan');
         res.send('Status berhasil diperbarui');
    });
});

// API Endpoint untuk MENGHAPUS Pengajuan (untuk Admin)
app.delete('/api/pengajuan/:id', verifyToken, (req, res) => {
    const { id } = req.params;

    // Langkah 1: Ambil nama file dari database sebelum dihapus
    const findSql = 'SELECT file_ktp, file_pernyataan, file_permohonan, file_berkas_izin, file_denah_lokasi FROM pengajuan WHERE id = ?';

    db.query(findSql, [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error saat mencari file.' });
        if (results.length === 0) return res.status(404).json({ message: 'Pengajuan tidak ditemukan.' });

        const filesToDelete = results[0];

        // Langkah 2: Hapus file dari folder 'uploads'
        Object.values(filesToDelete).forEach(filename => {
            if (filename) {
                const filePath = path.join(__dirname, 'uploads', filename);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        // Abaikan error jika file tidak ditemukan, tapi log error lain
                        if (unlinkErr.code !== 'ENOENT') {
                            console.error('Gagal menghapus file:', filePath, unlinkErr);
                        }
                    }
                });
            }
        });

        // Langkah 3: Hapus data dari database
        const deleteSql = 'DELETE FROM pengajuan WHERE id = ?';
        db.query(deleteSql, [id], (deleteErr, deleteResult) => {
            if (deleteErr) return res.status(500).json({ message: 'Server error saat menghapus data.' });
            res.status(200).json({ message: 'Pengajuan berhasil dihapus.' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server backend berjalan di http://localhost:${port}`);
});
