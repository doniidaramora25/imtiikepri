# Portal Keanggotaan IMTII Kepri

## Keputusan akses
- Super Admin IMTII Kepri adalah satu-satunya role yang dapat membuat, mengubah, dan menghapus profil himpunan, anggota, struktur kepengurusan, serta riwayat periode.
- Akun anggota hanya dapat melihat profil keanggotaannya sendiri dan mengganti password.
- Tidak ada direktori anggota atau data internal yang dipublikasikan ke halaman umum.

## File
- \`direktori.html\`: halaman login dan dashboard Portal Keanggotaan.
- \`portal.css\`, \`portal.js\`: antarmuka portal.
- \`google-apps-script/Portal.gs\`: backend Google Apps Script.
- \`index.html\`: navigasi publik mengarah ke Portal Keanggotaan.

## Aktivasi backend
1. Buka Google Spreadsheet IMTII Kepri yang telah digunakan sebelumnya.
2. Extensions → Apps Script. Tambahkan file script baru bernama \`Portal.gs\`, lalu salin isi \`google-apps-script/Portal.gs\`.
3. Pada Project Settings → Script Properties, tambahkan \`SUPER_ADMIN_EMAIL\` dengan email resmi Super Admin IMTII Kepri.
4. Jalankan \`setupPortal()\` satu kali dari editor Apps Script dan berikan izin yang diminta.
5. Buka Execution log. Salin password sementara Super Admin; password hanya dicetak saat akun dibuat dan wajib diganti setelah login pertama.
6. Deploy → New deployment → Web app. Execute as: Me. Atur akses agar endpoint dapat menerima request dari website; spreadsheet tetap privat dan jangan dibagikan ke anggota.
7. Salin URL deployment yang berakhir dengan \`/exec\`. Tempelkan ke \`window.IMTII_PORTAL_CONFIG.appsScriptUrl\` di bagian bawah \`direktori.html\`.
8. Deploy website ke Vercel dan uji login admin. Tambahkan satu himpunan, satu periode, struktur, dan anggota uji; hapus data uji setelah pemeriksaan.
9. Buat akun anggota melalui tab Anggota. Password sementara hanya ditampilkan satu kali; kirim melalui kanal pribadi, bukan grup publik.

## Struktur sheet
\`Users\`, \`Associations\`, \`Members\`, \`Leadership\`, \`Periods\`, \`Sessions\`, dan \`AuditLog\`. Fungsi setup membuat sheet baru jika belum ada dan tidak menghapus tab lama seperti \`Pendataan Himpunan\`.

## Catatan keamanan dan batasan
- Spreadsheet harus tetap privat. Jangan mengaktifkan akses publik pada file.
- Gunakan password kuat minimal 12 karakter dan ganti password sementara pada login pertama.
- Session berlaku 8 jam. Password disimpan sebagai hash SHA-256 bersalt berulang; token sesi disimpan sebagai hash di spreadsheet.
- Endpoint Apps Script dapat diakses dari browser untuk melayani login. Terapkan pembatasan akses Google Workspace bila seluruh anggota berada dalam domain yang sama. Jika endpoint dipublikasikan untuk umum, lakukan pengujian keamanan dan pembatasan percobaan login sebelum mengisi data pribadi berskala besar.
- Fitur ini merupakan baseline operasional. Sebelum menyimpan data sensitif dalam jumlah besar, lakukan audit keamanan, backup terjadwal, dan uji pemulihan data.
- URL Web App harus diisi sendiri setelah deployment. Jangan menaruh password atau kredensial admin di file frontend.
