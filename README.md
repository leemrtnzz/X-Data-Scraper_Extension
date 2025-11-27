# AUTHOR
Muhammad Ichsan Haekal

# find me on:

[![GitHub](https://img.shields.io/badge/GitHub-Profile-blue.svg)](https://github.com/leemrtnzz)

![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/uduktrash)

[![Instagram](https://img.shields.io/badge/Instagram-Profile-blue.svg)](https://www.instagram.com/yovtrash)

# X Data Scraper Extension

X Data Scraper adalah ekstensi browser canggih yang dirancang untuk mengumpulkan data dari X (sebelumnya Twitter) secara otomatis. Alat ini bekerja dengan memantau lalu lintas jaringan (network traffic) untuk menangkap data dari endpoint GraphQL Twitter secara real-time.

Ekstensi ini sangat berguna untuk peneliti, analis data, atau siapa saja yang membutuhkan dataset tweet yang terstruktur tanpa proses manual yang rumit.

## ✨ Features

Collect User Profiles & Tweets: Menangkap informasi detail profil pengguna dan konten tweet lengkap (teks, media, hashtag, dll).

Advanced Search Functionality: Bekerja pada halaman pencarian, timeline profil, maupun beranda utama.

Export Data as JSON: Unduh data yang telah dikumpulkan dalam format JSON yang bersih dan siap dianalisis.

Real-time Data Tracking: Memantau jumlah data yang berhasil diambil secara langsung melalui popup ekstensi.

Seamless Integration: Berjalan di latar belakang saat Anda menjelajahi X secara normal.

## 🚀 Installation

Karena ekstensi ini bersifat custom (tidak dari Web Store), instalasi dilakukan secara manual:

Siapkan File: Pastikan semua file proyek (manifest.json, content.js, injected.js, popup.html, popup.js) berada dalam satu folder.

- Buka Chrome Extensions:

- Buka browser Chrome/Edge/Brave.

- Masuk ke URL: chrome://extensions.

### Aktifkan Developer Mode:

- Nyalakan toggle "Developer mode" di pojok kanan atas.

Load Unpacked:

- Klik tombol "Load unpacked" di kiri atas.

- Pilih folder tempat Anda menyimpan file ekstensi ini.

Selesai: Ikon ekstensi akan muncul di toolbar browser Anda.

## 📖 How to Use

1. Buka x.com dan masuk ke akun Anda.

2. Navigasikan ke halaman yang ingin di-scrap (misalnya hasil pencarian hashtag tertentu).

`PENTING: Refresh halaman (F5) satu kali agar script interceptor aktif.`

3. Klik ikon ekstensi untuk membuka panel kontrol.

4. Mulai scroll halaman ke bawah. Ekstensi akan otomatis menangkap data baru yang dimuat.

5. Klik tombol Download JSON untuk menyimpan hasilnya.

# ⚠️ Disclaimer

Alat ini dibuat hanya untuk tujuan edukasi dan penelitian. Harap gunakan secara bertanggung jawab. Pengambilan data secara masif dan cepat (scraping agresif) dapat melanggar Ketentuan Layanan X dan berisiko pada pembatasan akun (rate limit). Gunakan dengan kecepatan wajar layaknya manusia.

> [!CAUTION]
> Semua risiko yang timbul dari penggunaan alat ini sepenuhnya menjadi tanggung jawab pengguna. Pengguna harus memastikan bahwa penggunaan alat ini sesuai dengan hukum dan regulasi yang berlaku di negara atau wilayahnya.