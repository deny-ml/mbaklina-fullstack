// src/components/Warga/FormPengajuan.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { CheckCircleIcon, ArrowDownTrayIcon, PaperClipIcon, ArrowRightIcon} from '@heroicons/react/24/solid';

// Komponen input file kustom untuk styling yang lebih baik
const FileInput = ({ label, name, accept, required, onChange, fileName }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1 flex items-center">
            <label htmlFor={name} className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center">
                <PaperClipIcon className="w-5 h-5 mr-2 text-slate-400" />
                Pilih File
            </label>



            <input 
                id={name} 
                name={name} 
                type="file" 
                className="sr-only" 
                accept={accept} 
                required={required} 
                onChange={onChange} 
                capture="environment" 
            />
            
            {fileName && <span className="ml-3 text-sm text-slate-500 truncate">{fileName}</span>}
        </div>
    </div>
);


function FormPengajuan() {
    const [formData, setFormData] = useState({
        nama_lengkap: '', nik: '', alamat: '', nomor_whatsapp: '', jumlah_peserta: '',
    });
    const [files, setFiles] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles.length > 0) {
            setFiles(prevFiles => ({ ...prevFiles, [name]: selectedFiles[0] }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.nik.length !== 16) {
            setError('NIK harus terdiri dari 16 digit angka.');
            setIsLoading(false);
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        Object.keys(files).forEach(key => data.append(key, files[key]));

        try {
            // gunakan API instance langsung di sini
            await api.post('/api/pengajuan', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setIsSubmitted(true);
        } catch (err) {
            setError('Gagal mengirim pengajuan. Pastikan semua file telah diunggah dan coba lagi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        // --- LOGIKA UNTUK KONFIRMASI WHATSAPP ---
        const nomorAdminWA = "6287766714810"; // PENTING: Ganti dengan nomor WA admin yang asli
        
        // Ambil nama dan NIK dari form yang sudah diisi untuk pesan otomatis
        const namaPemohon = formData.nama_lengkap;
        const nikPemohon = formData.nik;

        // Buat template pesan otomatis
        const pesanWA = `KONFIRMASI PENGAJUAN IZIN\n\nNama: ${namaPemohon}\nNIK: ${nikPemohon}\n\nSaya telah selesai mengisi formulir pengajuan izin penutupan jalan dan memohon untuk proses selanjutnya. Terima kasih.`;
        
        // Encode pesan agar aman digunakan di URL
        const linkWA = `https://wa.me/${nomorAdminWA}?text=${encodeURIComponent(pesanWA)}`;

        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
                <div className="max-w-lg w-full text-center bg-white p-8 rounded-xl shadow-lg">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto" />
                    <h2 className="mt-4 text-2xl font-bold text-slate-800">Satu Langkah Terakhir!</h2>
                    <p className="mt-2 text-slate-600">
                        Data Anda sudah kami terima. Untuk memverifikasi pengajuan, silakan lakukan konfirmasi melalui WhatsApp.
                    </p>
                    
                    <div className="mt-6 text-left p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <h3 className="font-semibold text-amber-800">Wajib Konfirmasi</h3>
                        <p className="mt-1 text-sm text-amber-700">
                            Pengajuan Anda baru akan diproses oleh admin **setelah Anda mengirimkan pesan konfirmasi** ke nomor WhatsApp kami.
                        </p>
                        
                        {/* Tombol Aksi "Satu-Klik" */}
                        <a 
                            href={linkWA}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 flex items-center justify-center w-full px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.85 14.85a1.2 1.2 0 01-1.7 0l-.88-.88a.8.8 0 00-1.13 0l-.2.2a.8.8 0 01-1.13 0l-2.83-2.83a.8.8 0 010-1.13l.2-.2a.8.8 0 000-1.13l-.88-.88a1.2 1.2 0 010-1.7l1.7-1.7a1.2 1.2 0 011.7 0l.88.88a.8.8 0 001.13 0l2.83 2.83a.8.8 0 010 1.13l-.2.2a.8.8 0 000 1.13l.88.88a1.2 1.2 0 010 1.7l-1.7 1.7z"></path></svg>
                            Kirim Konfirmasi via WhatsApp
                        </a>
                    </div>

                    <button onClick={() => window.location.reload()} className="mt-6 text-sm text-slate-500 hover:text-slate-700 hover:underline">Abaikan & Ajukan Permohonan Lain</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-blue-50 via-slate-50 to-white overflow-x-hidden">
            <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
                
                {/* === AREA ATAS (HERO) === */}
                {/* PERUBAHAN 1: Alignment diubah dari items-end menjadi items-center */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">

                    {/* Judul Aplikasi dan Tagline (Kiri) */}
                    <div className="w-3/5 text-left">
                        
                        {/* PERUBAHAN 2: Logo Instansi dipindahkan ke sini */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-4">
                            <img src="/assets/images/logo-kabupaten.png" alt="Logo Kabupaten" className="h-10 sm:h-12" />
                            <img src="/assets/images/logo-dishub.png" alt="Logo Dishub" className="h-10 sm:h-12" />
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-800 drop-shadow-md">
                            MBAK LINA
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-slate-700 mt-1 sm:mt-2 drop-shadow-sm font-medium">
                            (Mobile Aplikasi Layanan Izin Penutupan Jalan)
                        </p>
                        
                        {/* PERUBAHAN 3: Tagline <p> dihapus sesuai permintaan */}

                    </div>

                    {/* FOTO MBAK LINA (Kanan) */}
                    <div className="w-2/5 md:w-1/3 flex-shrink-0">
                        <img 
                            src="/assets/images/mbak-lina.png"
                            alt="Mbak Lina - Asisten Digital"
                            className="w-full h-auto object-contain drop-shadow-xl"
                        />
                    </div>
                </div>

                {/* --- KARTU FORMULIR --- */}
                {/* Penyesuaian: Nilai margin-top disesuaikan lagi untuk estetika terbaik */}
                <main className="bg-white rounded-xl shadow-2xl w-full border border-slate-200 -mt-5 sm:-mt-14 md:-mt-20 lg:-mt-24 relative z-20">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                        <div className="mb-8 text-center ">
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                                Formulir Pengajuan Izin 
                                <p className="ml-2 font-medium text-slate-500">(Rekomendasi)</p>
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Silakan lengkapi semua data di bawah ini.</p>
                        </div>

                        {/* Pembatas untuk memisahkan judul baru dengan isian pertama */}
                        <div className="border-t border-slate-200 pt-8 mt-8">
                            <h3 className="text-lg font-semibold text-slate-700">1. Data Diri Pemohon</h3>
                            <p className="text-sm text-slate-500">Pastikan data sesuai dengan KTP.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mt-6">
                                {/* Nama, NIK, Alamat, WA */}
                                <div>
                                    <label htmlFor="nama_lengkap" className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                                    <input type="text" id="nama_lengkap" name="nama_lengkap" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="nik" className="block text-sm font-medium text-slate-700">Nomor Induk Kependudukan (NIK)</label>
                                    <input type="text" id="nik" name="nik" pattern="\d{16}" title="NIK harus 16 digit angka" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="alamat" className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                                    <textarea id="alamat" name="alamat" rows="3" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                                </div>
                                <div>
                                    <label htmlFor="nomor_whatsapp" className="block text-sm font-medium text-slate-700">Nomor WhatsApp Aktif</label>
                                    <input type="tel" id="nomor_whatsapp" name="nomor_whatsapp" placeholder="Contoh: 081234567890" onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label htmlFor="jumlah_peserta" className="block text-sm font-medium text-slate-700">Estimasi Jumlah Peserta/Tamu</label>
                                    <input 
                                        type="number" 
                                        id="jumlah_peserta" 
                                        name="jumlah_peserta"
                                        min="1"
                                        placeholder="Contoh: 100"
                                        onChange={handleChange} 
                                        required 
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* Bagian Unggah Berkas */}
                        <div className="mt-10 pt-8 border-t border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-700">2. Unggah Berkas Persyaratan</h3>
                            <p className="text-sm text-slate-500">Format yang diterima: PDF, JPG, PNG.</p>
                            
                            {/* PENAMBAHAN: Informasi Batasan Ukuran File */}
                            <p className="text-sm text-slate-500 mt-1">
                                Ukuran maksimal untuk setiap file adalah <span className="font-bold text-rose-600">2 MB</span>.
                            </p>
                            
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <FileInput label="Scan/Foto KTP" name="file_ktp" accept=".jpg,.jpeg,.png,.pdf" required onChange={handleFileChange} fileName={files.file_ktp?.name} />
                                <FileInput label="Surat Pernyataan" name="file_pernyataan" accept=".jpg,.jpeg,.png,.pdf" required onChange={handleFileChange} fileName={files.file_pernyataan?.name} />
                                <FileInput label="Surat Permohonan" name="file_permohonan" accept=".jpg,.jpeg,.png,.pdf" required onChange={handleFileChange} fileName={files.file_permohonan?.name} />
                                <FileInput label="Surat Izin Polsek" name="file_berkas_izin" accept=".jpg,.jpeg,.png,.pdf" required onChange={handleFileChange} fileName={files.file_berkas_izin?.name} />
                                <FileInput label="Peta/Denah Lokasi" name="file_denah_lokasi" accept=".jpg,.jpeg,.png,.pdf" required onChange={handleFileChange} fileName={files.file_denah_lokasi?.name} />
                            </div>
                        </div>
                        
                        {/* Template Links, Tombol Kirim, Error Message */}
                        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="text-sm font-semibold text-blue-800">Butuh Template Surat?</h3>
                            <p className="text-sm text-blue-700 mt-1">Unduh template dokumen jika Anda belum memilikinya.</p>
                            <div className="mt-3 flex flex-col sm:flex-row gap-3">
                                <a href="/templates/template-surat-pernyataan.docx" download className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"><ArrowDownTrayIcon className="w-4 h-4" /> Template Surat Pernyataan.docx</a>
                                <a href="/templates/template-surat-permohonan.docx" download className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"><ArrowDownTrayIcon className="w-4 h-4" /> Template Surat Permohonan.docx</a>
                            </div>
                        </div>
                        {error && (<div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">{error}</div>)}
                        <div className="mt-10 pt-6 border-t border-slate-200 flex justify-end">
                            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                {isLoading ? 'Memproses...' : 'Kirim Pengajuan'}
                                {!isLoading && <ArrowRightIcon className="w-5 h-5 ml-2" />}
                            </button>
                        </div>
                    </form>
                </main>
                
                <footer className="text-center mt-8 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Dinas Perhubungan Kabupaten Blitar. Semua Hak Cipta Dilindungi.</p>
                </footer>
                </div>
            
        </div>
    );
}

export default FormPengajuan;
