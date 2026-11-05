# Add-on Direktori Himpunan IMTII Kepri

Paket ini dirancang untuk ditambahkan ke website statis IMTII Kepri yang menggunakan `index.html`, `styles.css`, `script.js`, dan folder `assets/`. File website asli tidak ditimpa oleh paket ini.

## Isi paket

- `direktori.html` — halaman direktori dan formulir pendataan.
- `direktori.css` — gaya halaman direktori, diselaraskan dengan palet navy/gold website.
- `direktori.js` — pencarian, filter wilayah, pemuatan profil terverifikasi, dan pengiriman formulir.
- `data/himpunan.json` — fallback kosong; sengaja tidak memuat data organisasi yang belum diverifikasi.
- `google-apps-script/Code.gs` — backend Google Sheets untuk menerima pengajuan dan menyediakan profil yang sudah diverifikasi.

## A. Tambahkan file ke repository

1. Salin `direktori.html`, `direktori.css`, dan `direktori.js` ke root repository yang sama dengan `index.html`.
2. Salin folder `data/` dan `google-apps-script/` ke root repository.
3. Pastikan `assets/logo-imtii-kepri.png` tetap tersedia. Halaman ini menggunakan `styles.css` dan `script.js` yang sudah ada.
4. Di `index.html`, tambahkan tautan navigasi ini ke dalam `<nav class="nav-links">`:

```html
<a href="direktori.html">Direktori Himpunan</a>
```

Letakkan di dekat tautan Berita/Galeri. Tidak perlu mengganti isi `index.html` yang lain.

## B. Aktifkan penyimpanan formulir dengan Google Sheets

1. Buat Google Spreadsheet baru yang akses editnya hanya untuk admin yang berwenang.
2. Buka Extensions → Apps Script.
3. Ganti isi `Code.gs` dengan kode pada `google-apps-script/Code.gs`.
4. Ganti `GANTI_DENGAN_ID_SPREADSHEET` pada `SPREADSHEET_ID` dengan ID spreadsheet. ID adalah bagian URL di antara `/d/` dan `/edit`.
5. Simpan lalu jalankan fungsi `setupSheet()` sekali dari editor Apps Script dan berikan izin yang diminta.
6. Deploy → New deployment → pilih Web app. Pilih Execute as: Me. Atur siapa yang dapat mengakses berdasarkan kebutuhan organisasi; akses publik memudahkan formulir, tetapi endpoint publik juga dapat menerima spam.
7. Salin URL Web App yang berakhir dengan `/exec`.
8. Pada bagian bawah `direktori.html`, cari:

```html
<script>window.IMTII_DIRECTORY_CONFIG = { appsScriptUrl: "", fallbackDataUrl: "data/himpunan.json" };</script>
```

Isi `appsScriptUrl` dengan URL Web App, misalnya:

```html
<script>window.IMTII_DIRECTORY_CONFIG = { appsScriptUrl: "https://script.google.com/macros/s/ID_DEPLOYMENT/exec", fallbackDataUrl: "data/himpunan.json" };</script>
```

Ganti contoh URL dengan URL deployment milik Anda sendiri.

## C. Verifikasi dan tampilkan profil

1. Data baru akan masuk ke tab `Pendataan Himpunan` dengan status `Menunggu verifikasi`.
2. Admin memeriksa nama resmi organisasi, kampus, masa kepengurusan, logo, dan persetujuan kontak.
3. Setelah valid, admin mengubah kolom `Status` menjadi persis `Terverifikasi`.
4. Isi kolom `Kontak Publik` dengan nomor WhatsApp yang telah disetujui untuk tampil pada kartu publik. Gunakan format internasional angka saja, misalnya `62812...`.
5. Profil dengan status selain `Terverifikasi` tidak akan muncul pada direktori publik.
6. Kolom `Catatan Admin` dapat dipakai untuk mencatat koreksi. Jangan simpan data sensitif yang tidak diperlukan.

## D. Penting untuk keamanan

- Jangan memasukkan data contoh sebagai fakta organisasi.
- Jangan membagikan spreadsheet dengan akses publik. Publik hanya membaca data yang statusnya `Terverifikasi` melalui halaman direktori.
- Minta persetujuan sebelum menampilkan nomor WhatsApp pribadi. Pertimbangkan nomor organisasi sebagai pilihan utama.
- Backend ini belum memiliki anti-spam/CAPTCHA atau autentikasi admin khusus. Untuk skala besar, tambahkan pembatasan pengajuan dan prosedur verifikasi admin.
- Website statis tidak menyimpan data sendiri. Formulir baru benar-benar tersimpan setelah URL Apps Script dikonfigurasi dan deployment diuji.

## E. Pengujian sebelum publikasi

- Buka `direktori.html` melalui domain Vercel (bukan hanya `file://`).
- Kirim satu data uji yang jelas diberi label uji; pastikan baris masuk ke spreadsheet dengan status `Menunggu verifikasi`.
- Pastikan data dengan status tersebut tidak tampil di kartu publik.
- Ubah status baris uji menjadi `Terverifikasi`, isi `Kontak Publik` dengan nomor uji yang aman, lalu muat ulang direktori untuk menguji tampilannya.
- Hapus data uji setelah selesai.
- Uji pencarian, filter wilayah, tampilan mobile, dan tautan WhatsApp/Instagram.
