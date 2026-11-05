# Website IMTII Wilayah Kepulauan Riau

Website publik statis dengan HTML, CSS, dan JavaScript. Tidak memerlukan proses build atau framework.

## Struktur
- `index.html` — seluruh halaman dan konten website.
- `styles.css` — sistem desain editorial responsif.
- `script.js` — navigasi mobile, tahun otomatis, progress scroll, dan header.
- `motion.js` — peningkatan animasi opsional menggunakan GSAP, ScrollTrigger, dan Lenis.
- `assets/logo-imtii-kepri.png` — logo organisasi.

## Menjalankan secara lokal
1. Ekstrak ZIP.
2. Buka folder `imtii-kepri-website`.
3. Jalankan `index.html` di browser. Untuk pengujian terbaik, gunakan VS Code + Live Server.

## Deployment ke Vercel
1. Unggah seluruh isi folder `imtii-kepri-website` ke root repository GitHub (bukan folder ZIP-nya).
2. Pastikan `index.html`, `styles.css`, `script.js`, `motion.js`, dan folder `assets/` berada pada root project.
3. Pada Vercel, gunakan Framework Preset **Other**, Build Command kosong, dan Output Directory `.`.
4. Deploy. Perubahan pada branch yang terhubung akan memicu deployment berikutnya.

## Teknologi dan fallback
- HTML5, CSS3, JavaScript native.
- GSAP 3.13.0, ScrollTrigger, dan Lenis dimuat melalui ESM CDN.
- Jika CDN atau koneksi internet gagal, navigasi dan seluruh konten tetap berfungsi dengan native scrolling.
- `prefers-reduced-motion` dihormati; animasi tambahan tidak dijalankan bila pengguna meminta pengurangan gerakan.
- Google Fonts juga dimuat dari CDN; font fallback tetap tersedia.

## Konten yang WAJIB diverifikasi sebelum website diumumkan
Beberapa bagian sengaja ditandai sebagai rancangan/placeholder karena dokumen resmi belum disertakan:
1. Sejarah: tanggal pendirian, kronologi, dan periode kepengurusan.
2. Kepengurusan: ganti nama contoh, jabatan, dan bidang sesuai SK resmi.
3. Visi-misi: validasi rumusan final melalui keputusan organisasi.
4. Program kerja: tetapkan nama final, indikator, jadwal, PIC, dan status kegiatan.
5. Publikasi: tema artikel adalah ide editorial, bukan berita kegiatan yang telah terlaksana.
6. Galeri: ganti panel grafis dengan foto kegiatan asli yang mendapat izin publikasi.
7. Kontak: tambahkan email, akun media sosial, tautan pendaftaran, dan kanal komunikasi resmi.

Jangan memublikasikan nama pengurus, tanggal sejarah, agenda, atau klaim kegiatan yang belum diverifikasi. Placeholder ditampilkan dengan keterangan agar tidak disalahartikan sebagai informasi faktual.

## Pengelolaan konten
Website ini merupakan frontend statis. Belum tersedia panel admin, database, autentikasi, atau formulir pendaftaran internal. Untuk pendaftaran awal, gunakan Google Forms resmi. Untuk berita dan galeri yang sering diperbarui, tahap berikutnya dapat memakai CMS atau backend terpisah.
