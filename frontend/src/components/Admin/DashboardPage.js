// src/components/Admin/DashboardPage.js
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { DocumentTextIcon, CheckIcon, XMarkIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LinkIcon } from '@heroicons/react/20/solid';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        Menunggu: "bg-amber-100 text-amber-800",
        Disetujui: "bg-emerald-100 text-emerald-800",
        Ditolak: "bg-rose-100 text-rose-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

function DashboardPage() {
    const [pengajuanList, setPengajuanList] = useState([]);
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPengajuan = async () => {
        try {
            const response = await api.get('/api/pengajuan');
            setPengajuanList(response.data);
        } catch (error) { console.error("Error fetching data:", error); }
    };

    useEffect(() => { fetchPengajuan(); }, []);

    const handleStatusChange = async (id, status) => {
        const action = status === 'Disetujui' ? 'menyetujui' : 'menolak';
        if (window.confirm(`Anda yakin ingin ${action} pengajuan ini?`)) {
            try {
                await api.put(`/api/pengajuan/${id}/status`, { status });
                fetchPengajuan();
            } catch (error) { console.error("Error updating status:", error); }
        }
    };

    const handleDelete = async (id) => {
        const confirmation = "Apakah Anda yakin ingin menghapus pengajuan ini secara PERMANEN?\nSemua data dan file terkait akan dihapus dan tindakan ini tidak bisa dibatalkan.";
        if (window.confirm(confirmation)) {
            try {
                await api.delete(`/api/pengajuan/${id}`);
                fetchPengajuan(); // Muat ulang data setelah berhasil dihapus
            } catch (error) {
                console.error("Gagal menghapus pengajuan:", error);
                alert("Gagal menghapus pengajuan. Silakan coba lagi.");
            }
        }
    };

    	const filteredList = Array.isArray(pengajuanList) ? pengajuanList.filter(p => {
        const matchesStatus = filterStatus === 'Semua' || p.status === filterStatus;
        
        // Pastikan properti ada sebelum melakukan toLowerCase() agar tidak error juga
        const namaCheck = p.nama_lengkap ? p.nama_lengkap.toLowerCase() : '';
        const nikCheck = p.nik ? p.nik.toLowerCase() : '';
        
        const matchesSearch = searchTerm === '' ||
            namaCheck.includes(searchTerm.toLowerCase()) ||
            nikCheck.includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    }) : [];

    const FilterButton = ({ status }) => (
        <button onClick={() => setFilterStatus(status)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filterStatus === status ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
        }`}>
            {status}
        </button>
    );

    return (
        <div>
            <header className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard Pengajuan Masuk</h1>
                <div className="mt-4 md:mt-0 flex items-center space-x-2 p-1 bg-slate-200 rounded-lg">
                    <FilterButton status="Semua" />
                    <FilterButton status="Menunggu" />
                    <FilterButton status="Disetujui" />
                    <FilterButton status="Ditolak" />
                </div>
            </header>

            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                
                {/* PERUBAHAN 3: Input field untuk pencarian ditambahkan di sini */}
                <div className="mb-6">
                    <label htmlFor="search" className="sr-only">Cari</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="search"
                            id="search"
                            className="block w-full max-w-sm rounded-md border-0 py-2 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="Cari berdasarkan nama atau NIK..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden sm:rounded-lg"> 
                                <table className="min-w-full divide-y divide-slate-300">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Pemohon</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Alamat Pemohon</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Kontak</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Jml. Peserta</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Dokumen</th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-left text-sm font-semibold text-slate-900">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {filteredList.length > 0 ? filteredList.map((p) => (
                                            <tr key={p.id}>
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                    <div className="font-medium text-slate-900">{p.nama_lengkap}</div>
                                                    <div className="text-slate-500">{p.nik}</div>
                                                </td>
                                                <td className="whitespace-normal px-3 py-4 text-sm text-slate-500 max-w-xs">{p.alamat}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                    <a href={`https://wa.me/62${p.nomor_whatsapp.substring(1)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800">
                                                        <LinkIcon className="h-4 w-4" />
                                                        {p.nomor_whatsapp}
                                                    </a>
                                                </td>
						<td className="px-6 py-4 text-sm text-gray-900 text-center">
    							{p.jumlah_peserta} Orang
						</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm"><StatusBadge status={p.status} /></td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                    <div className="flex flex-col space-y-1">
                                                        {[
                                                            { file: p.file_ktp, label: 'KTP' },
                                                            { file: p.file_pernyataan, label: 'Pernyataan' },
                                                            { file: p.file_permohonan, label: 'Permohonan' },
                                                            { file: p.file_berkas_izin, label: 'Izin' },
                                                            { file: p.file_denah_lokasi, label: 'Denah' },
                                                        ].map(doc => doc.file && (
                                                            <a key={doc.label} href={`${process.env.REACT_APP_API_URL}/uploads/${doc.file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-blue-600">
                                                                <DocumentTextIcon className="h-4 w-4" /> {doc.label}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6">
                                                    <div className="flex items-center space-x-2">
                                                        {p.status === 'Menunggu' && (
                                                            <>
                                                                <button onClick={() => handleStatusChange(p.id, 'Disetujui')} title="Setujui" className="inline-flex items-center justify-center p-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                                                    <CheckIcon className="h-5 w-5" />
                                                                </button>
                                                                <button onClick={() => handleStatusChange(p.id, 'Ditolak')} title="Tolak" className="inline-flex items-center justify-center p-2 text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500">
                                                                    <XMarkIcon className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                        
                                                        {/* Tombol Hapus akan muncul jika status BUKAN 'Menunggu' */}
                                                        {(p.status === 'Disetujui' || p.status === 'Ditolak') && (
                                                            <button onClick={() => handleDelete(p.id)} title="Hapus Permanen" className="inline-flex items-center justify-center p-2 text-slate-500 bg-slate-100 hover:bg-rose-200 hover:text-rose-700 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500">
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center py-10 text-slate-500">
                                                    {searchTerm ? `Tidak ada data yang cocok dengan pencarian "${searchTerm}".` : `Tidak ada data untuk status "${filterStatus}".`}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
