// backend/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js'); 

const app = express();
const port = process.env.PORT || 5000;

// Keamanan JWT menggunakan Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_cadangan_rahasia_mbak_lina';

// Konfigurasi Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// --- Konfigurasi Multer (Pindah ke RAM/Memory) ---
const storage = multer.memoryStorage(); // File ditahan di RAM sementara
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } // 2 Megabytes
});

// --- Endpoint Publik (Upload) ---
app.post('/api/pengajuan', upload.fields([
    { name: 'file_ktp', maxCount: 1 }, { name: 'file_pernyataan', maxCount: 1 },
    { name: 'file_permohonan', maxCount: 1 }, { name: 'file_berkas_izin', maxCount: 1 },
    { name: 'file_denah_lokasi', maxCount: 1 }
]), async (req, res) => { 

    console.log("👉 [DEBUG] Request masuk ke /api/pengajuan");
    const data = req.body;
    const files = req.files;

    // Cek kelengkapan file dasar
    if (!files || !files['file_ktp'] || !files['file_pernyataan'] || !files['file_permohonan'] || !files['file_berkas_izin'] || !files['file_denah_lokasi']) {
        return res.status(400).send('Upload file tidak lengkap. Pastikan semua file wajib telah dipilih.');
    }

    // FUNGSI SAKTI UNTUK UPLOAD KE SUPABASE
    const uploadToSupabase = async (fieldName) => {
        if (files && files[fieldName] && files[fieldName][0]) {
            const file = files[fieldName][0];
            // Bersihkan nama file dari spasi
            const cleanFileName = file.originalname.replace(/\s+/g, '_');
            const uniqueName = `${data.nik}-${Date.now()}-${cleanFileName}`;
            
            // Proses upload ke Supabase
            const { error } = await supabase.storage
                .from('berkas_pengajuan') 
                .upload(uniqueName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error("❌ Error Upload Supabase:", error);
                return null;
            }

            // Ambil URL Publik file tersebut
            const { data: publicUrlData } = supabase.storage
                .from('berkas_pengajuan')
                .getPublicUrl(uniqueName);

            return publicUrlData.publicUrl;
        }
        return null;
    };

    try {
        console.log("⏳ Sedang mengunggah file ke Supabase...");
        
        // Upload file secara berurutan dan dapatkan URL-nya
        const url_ktp = await uploadToSupabase('file_ktp');
        const url_pernyataan = await uploadToSupabase('file_pernyataan');
        const url_permohonan = await uploadToSupabase('file_permohonan');
        const url_berkas_izin = await uploadToSupabase('file_berkas_izin');
        const url_denah_lokasi = await uploadToSupabase('file_denah_lokasi');

        // Pastikan semua upload berhasil
        if (!url_ktp || !url_pernyataan || !url_permohonan || !url_berkas_izin || !url_denah_lokasi) {
            return res.status(500).send('Gagal mengunggah beberapa file ke server Cloud.');
        }

        const sql = `INSERT INTO pengajuan (nama_lengkap, nik, alamat, nomor_whatsapp, jumlah_peserta, file_ktp, file_pernyataan, file_permohonan, file_berkas_izin, file_denah_lokasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            data.nama_lengkap, data.nik, data.alamat, data.nomor_whatsapp, data.jumlah_peserta,
            url_ktp, url_pernyataan, url_permohonan, url_berkas_izin, url_denah_lokasi // Sekarang menyimpan URL panjang, bukan nama file
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("❌ [DEBUG] Error Database:", err.sqlMessage || err);
                return res.status(500).send('Server error saat menyimpan data.');
            }
            console.log("✅ [DEBUG] Berhasil simpan ke DB. ID:", result.insertId);
            res.status(201).send('Pengajuan berhasil dikirim');
        });

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        res.status(500).send('Terjadi kesalahan internal server.');
    }
});

// --- Endpoint Otentikasi ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM admins WHERE username = ?';
    
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(401).json({ message: 'Username atau password salah' });

        const admin = results[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Username atau password salah' });

        const payload = { id: admin.id, username: admin.username };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    });
});

// --- Middleware untuk Proteksi Rute ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
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
         res.send('Status berhasil diperbarui');
    });
});

// Endpoint DELETE 
app.delete('/api/pengajuan/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const deleteSql = 'DELETE FROM pengajuan WHERE id = ?';
    db.query(deleteSql, [id], (deleteErr) => {
        if (deleteErr) return res.status(500).json({ message: 'Server error saat menghapus data.' });
        res.status(200).json({ message: 'Pengajuan berhasil dihapus.' });
    });
});

app.listen(port, () => {
    console.log(`Server backend berjalan di http://localhost:${port}`);
});
module.exports = app;