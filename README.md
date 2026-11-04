# Website IMTII Wilayah Kepulauan Riau

Starter website statis responsif menggunakan HTML, CSS, dan JavaScript. Tidak memerlukan framework atau build tools.

## Isi paket
- `index.html` — halaman publik dan struktur konten
- `styles.css` — desain responsif desktop, tablet, dan mobile
- `script.js` — navigasi mobile dan tahun otomatis

## Jalankan di komputer
1. Ekstrak ZIP.
2. Buka `index.html` menggunakan browser.
3. Untuk pengembangan, gunakan VS Code dan ekstensi Live Server (opsional).

## Publikasikan gratis dengan GitHub Pages
1. Buat akun di https://github.com/ jika belum punya.
2. Buat repository baru, misalnya `imtii-kepri`.
3. Upload `index.html`, `styles.css`, dan `script.js` ke root repository.
4. Buka **Settings → Pages**.
5. Pada bagian Build and deployment, pilih **Deploy from a branch**.
6. Pilih branch `main`, folder `/ (root)`, lalu Save.
7. Tunggu proses deployment. URL publik akan berbentuk `https://USERNAME.github.io/imtii-kepri/`.

## Sebelum dipublikasikan
- Pastikan nama, logo, sejarah, visi-misi, struktur, dan informasi organisasi telah disetujui pengurus.
- Ganti semua konten contoh dan dokumentasi ilustratif dengan materi resmi.
- Ganti tautan tombol pendaftaran (`id="join-link"`) di `index.html` dengan URL Google Form resmi.
- Ganti tautan Google Calendar di bagian agenda dengan kalender organisasi yang dapat dilihat publik.
- Tambahkan tautan media sosial dan kontak resmi.
- Gunakan foto yang dimiliki organisasi atau yang telah mendapat izin publikasi.

## Fitur admin dan data anggota
Paket ini adalah **frontend publik tahap awal**. Belum ada login admin, database, ataupun penyimpanan pendaftaran. Jangan membuat login palsu berbasis JavaScript atau menyimpan kata sandi di file website.

Arsitektur gratis yang disarankan untuk tahap berikutnya:
- Google Forms untuk pendaftaran anggota.
- Google Sheets sebagai daftar pendaftar yang aksesnya dibatasi hanya untuk pengurus berwenang.
- Google Calendar untuk agenda publik.
- Google Apps Script sebagai backend bila ingin membuat panel admin khusus.

Untuk panel admin yang aman, autentikasi dan pemeriksaan izin harus dilakukan di sisi server. Jangan pernah menaruh token rahasia, kata sandi, atau kunci API privat di HTML/JavaScript publik.

## Batasan layanan gratis
GitHub Pages cocok untuk website statis. Layanan gratis dapat memiliki batas penggunaan, dan tidak otomatis memberikan database atau autentikasi. Periksa ketentuan layanan terbaru sebelum digunakan untuk kebutuhan organisasi berskala besar.


## Logo IMTII Kepri

Logo organisasi disimpan pada `assets/logo-imtii-kepri.png` dan digunakan pada navigasi header, footer, serta favicon browser. Jika ingin mengganti logo, pertahankan nama file tersebut atau sesuaikan path pada `index.html`.


## Efek interaktif
Versi ini menambahkan: smooth in-page scrolling, custom cursor untuk perangkat mouse/trackpad, scroll progress bar, header shadow saat halaman digulir, reveal animation saat elemen masuk viewport, dan hover depth pada kartu. Efek cursor otomatis dinonaktifkan pada perangkat layar sentuh. Preferensi `prefers-reduced-motion` juga dihormati.

Tidak ada framework atau build step tambahan. Semua efek dibuat menggunakan CSS dan JavaScript native agar tetap cocok untuk hosting statis GitHub/Vercel.


## Animasi GSAP + ScrollTrigger + Lenis

Website menggunakan GSAP 3.13.0, plugin ScrollTrigger, dan Lenis 1.3.11 melalui CDN. Library dimuat sebelum `script.js`. Implementasi mencakup smooth scrolling, animasi masuk hero, reveal bertahap pada seluruh section/kartu/daftar, parallax ringan pada elemen dekoratif hero, dan progress bar.

**Aksesibilitas dan fallback:** animasi serta smooth scrolling dinonaktifkan ketika `prefers-reduced-motion: reduce` aktif. Jika salah satu library CDN gagal dimuat, navigasi tetap berjalan menggunakan native browser scrolling dan seluruh konten tetap terlihat.

**Catatan deployment:** koneksi internet diperlukan agar library CDN dapat dimuat. Jika ingin self-host library, unduh file GSAP, ScrollTrigger, dan Lenis lalu sesuaikan path `<script>` pada `index.html`.
