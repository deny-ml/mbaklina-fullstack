# MBAK LINA (Mobile Aplikasi Layanan Izin Penutupan Jalan)
**Dinas Perhubungan Kabupaten Blitar**

Aplikasi ini bertujuan untuk mempermudah masyarakat dalam mengajukan perizinan penutupan jalan untuk kegiatan keramaian secara online, transparan, dan efisien.

## 📁 Dokumen Kelengkapan
Dokumen teknis lengkap (SRS, BCP, API Specs, User Roles) dapat ditemukan di dalam folder:
👉 **[ /docs ](./docs)**

## 🚀 Arsitektur Teknologi
Aplikasi ini dibangun menggunakan arsitektur **Microservices** dengan containerization:
* **Frontend:** React.js (Port 8080)
* **Backend:** Node.js Express (Port 5000)
* **Database:** MySQL 5.7
* **Keamanan:** OWASP ModSecurity Core Rule Set (WAF) di Port 80

## 🛠️ Prosedur Instalasi (Deployment)

Berikut adalah langkah-langkah instalasi aplikasi di server (Ubuntu/Linux):

1.  **Clone Repository**
    ```bash
    git clone [https://gitlink.blitarkab.go.id/username_anda/mbaklina-dishub.git](https://gitlink.blitarkab.go.id/username_anda/mbaklina-dishub.git)
    cd mbaklina-dishub
    ```

2.  **Konfigurasi Environment**
    Buat file `.env` di root folder dan sesuaikan dengan konfigurasi server Anda:
    ```bash
    # Contoh Konfigurasi (Sesuaikan Nilainya)
    DB_HOST=db
    DB_USER=admin_db
    DB_PASSWORD=ganti_password_ini
    DB_ROOT_PASSWORD=ganti_password_root_ini
    DB_NAME=db_penutupan_jalan
    JWT_SECRET=rahasia_token_acak_yang_panjang
    REACT_APP_API_URL=http://ip_server_anda:5000
    ```

3.  **Menjalankan Aplikasi (Docker)**
    Pastikan Docker sudah terinstall, lalu jalankan:
    ```bash
    sudo docker compose up -d --build
    ```

4.  **Import Database**
    Pastikan file SQL sudah ada, lalu jalankan:
    ```bash
    cat db_penutupan_jalan.sql | sudo docker exec -i mbaklina_db_1 mysql -u admin_db -p<password_anda> db_penutupan_jalan
    ```

## 🛡️ Keamanan
Aplikasi ini telah menerapkan standar keamanan:
* ModSecurity WAF (Web Application Firewall).
* Anti-Defacement Monitoring Tag.
* Enkripsi Password Admin (Bcrypt).
* Validasi File Upload.

---
&copy; 2025 Dinas Perhubungan Kabupaten Blitar.
