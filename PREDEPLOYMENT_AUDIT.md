# PRE-DEPLOYMENT AUDIT

Tanggal: 15 Oktober 2026. Target: Vercel. Status: **NOT READY TO DEPLOY**.

Audit dan perbaikan diterapkan langsung pada proyek poto-poto. Tidak ada deployment, commit, atau perubahan terhadap nilai credential yang dilakukan. Database yang terkonfigurasi diperiksa read-only; pengujian API menggunakan MongoDB sementara dan credential pengujian.

| Area | Status | Bukti dan batas pengujian |
|---|---|---|
| MongoDB | PASS | URI terkonfigurasi berhasil connect/ping. Cache koneksi per instance, hot reload, pool 5, timeout dan retry setelah kegagalan diperbaiki. Model reuse mencegah OverwriteModelError. Database memiliki 0 frame, 0 URL lokal, dan 0 duplicate slug. |
| Admin Auth | FAIL konfigurasi | ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET belum terisi. Implementasi telah lolos uji production menggunakan credential sementara: redirects, API guards, Secure/HttpOnly/SameSite cookie, CSRF, logout revocation, dan throttle MongoDB yang tetap berlaku setelah restart proses. |
| Frame CRUD | FAIL integrasi live | List, publish/unpublish, filtering, validasi update dan delete metadata lulus uji API. Upload nyata gagal HTTP 401 dari Cloudinary. Upload/delete asset serta rollback lulus unit test dengan provider disimulasikan, bukan bukti layanan live bekerja. |
| Frame Storage | FAIL konfigurasi | Adapter Cloudinary server-side sudah menggantikan filesystem lokal. URL HTTPS dan public ID disimpan. Provider menolak konfigurasi dengan cloud_name mismatch / Invalid cloud_name. |
| Client Integration | FAIL verifikasi end-to-end | Published fetch, urutan terbaru, loading/empty/error, polling, dan overlay CORS sudah ditinjau/diperbaiki. Alur upload live → pilih → capture → export belum terbukti karena Cloudinary gagal. Kamera nyata dan canvas export belum diuji melalui browser dalam audit ini. |
| Security | PASS pemeriksaan yang dijalankan | Admin guards dan CSRF lulus; secret server-only; scan nilai secret pada bundle client bersih; debug test-db dihapus; payload dibatasi; hanya field publish yang dapat diperbarui; tidak ada local filesystem upload. Runtime audit: 0 vulnerabilities. |
| TypeScript | PASS | npx tsc --noEmit exit 0. Import/export Frame dan tipe cache global diperbaiki. |
| Lint | PASS | npm run lint exit 0, tanpa menonaktifkan lint global. |
| Production Build | PASS | npm run build exit 0, Next.js 16.3.8. |
| Vercel Compatibility | FAIL readiness | Kode menggunakan Node.js runtime dan cloud storage, tanpa persistent filesystem dependency. Akan tetapi konfigurasi admin belum lengkap, Cloudinary ditolak, dan env Vercel belum diperiksa. |

## Blocker nyata sebelum deployment

1. Isi `ADMIN_EMAIL`, `ADMIN_PASSWORD` (minimal 16 karakter), dan `ADMIN_SESSION_SECRET` (acak, minimal 32 karakter).
2. Perbaiki `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, dan `CLOUDINARY_API_SECRET` agar berasal dari product environment yang sama. Ping dan upload nyata sama-sama ditolak HTTP 401.

Pasang seluruh tujuh variable `.env.example` pada environment Vercel yang dituju, termasuk `MONGODB_URI`. `npm run preflight` harus lolos setelah konfigurasi diperbaiki. Lalu verifikasi upload/delete Cloudinary nyata dan smoke test photobooth lengkap pada Vercel Preview sebelum promosi production. Konfigurasi Vercel tidak dapat disimpulkan dari konfigurasi lokal.

## Perbaikan yang diterapkan

- Memperbaiki export model Frame, menambahkan tipe model, mempertahankan unique slug, required fields dan timestamps. Menambahkan cloudinaryPublicId agar asset dapat dihapus. Slug baru memakai suffix UUID sehingga display name dapat berulang.
- Memperbaiki cache MongoDB, lazy environment lookup, retry failure, pool dan timeout. Unique index ditunggu sebelum upload membuat metadata.
- Mengganti limiter login in-memory dengan counter atomik MongoDB dan TTL; menambahkan HMAC fingerprint menggunakan session secret. Session token tetap opaque dan dihash pada database.
- Menambahkan `/admin` redirect berdasarkan session; menghapus `/api/test-db`.
- Mengganti local storage dengan Cloudinary upload stream dan destroy dengan invalidasi. Failed upload/metadata creation mencoba cleanup; failed delete menyisakan metadata tidak terpublikasi agar bisa diulang. MongoDB/Cloudinary tidak memiliki transaksi atomik bersama; cleanup yang gagal dicatat dengan public ID untuk rekonsiliasi.
- Mengurangi batas file menjadi 4 MiB dan membatasi multipart overhead 64 KiB agar berada di bawah batas payload Vercel 4,5 MB. Validasi PNG signature, MIME, ukuran, decode, dimensi dan transparansi tetap diterapkan.
- Menambahkan `crossOrigin="anonymous"` sebelum memuat overlay remote, serta empty state frame picker. Komposisi 720 × 2224 dan posisi empat foto dipertahankan.
- Menggunakan `server-only` untuk modul credential, database, model dan storage; menambahkan security headers dasar tanpa memblokir kamera sendiri.
- Memperbarui Next.js/eslint-config-next ke patch 16.3.8 dan transitive dependency yang dapat diperbaiki tanpa breaking downgrade. `.env.example` kini berisi key kosong.
- Menambahkan `npm run preflight`, regression tests, dan panduan deployment di README.

## Pengujian

- `npm run lint`: PASS.
- `npm run test`: 2 suite/test lulus, mencakup PNG valid/invalid, batas ukuran, dimensi, opaque slots, generated public ID, cloud upload/delete mock, cleanup kegagalan, required fields, defaults, unique schema dan timestamps.
- `npm run build`: PASS.
- `npx tsc --noEmit`: PASS.
- API integration pada `next start` dengan MongoDB sementara: PASS untuk admin redirects, semua metode API yang membutuhkan auth, cookie production, Origin/CSRF, list draft/public filtering, publish/unpublish, penolakan metadata update, delete legacy metadata, logout/replayed cookie, limiter setelah restart dan 404 test-db.
- MongoDB terkonfigurasi: connect/ping PASS; tidak ada frame lama yang perlu dimigrasikan.
- Cloudinary terkonfigurasi: ping dan upload FAIL HTTP 401. Tidak ada upload berhasil atau asset pengujian yang dibuat oleh panggilan yang ditolak ini.
- `npm run preflight`: exit 1 sesuai blocker di atas, tanpa mencetak credential.
- `npm audit --omit=dev`: 0 vulnerabilities. Full audit masih melaporkan 5 high pada rantai dev-only braces → micromatch → fast-glob → ESLint Next. npm menyarankan downgrade breaking ke eslint-config-next 14; downgrade tidak diterapkan. Ini tidak dilaporkan sebagai runtime vulnerability.
- Git: hanya `.env.example` yang terlacak dari `.env*`; `.env`, `.env.local`, `.env.production`, node_modules dan .next di-ignore. Nilai credential terkonfigurasi tidak ditemukan pada bundle browser.

## Referensi

- [Batas Vercel Functions](https://vercel.com/docs/functions/limitations): payload maksimum 4,5 MB.
- [Cloudinary Node upload](https://cloudinary.com/documentation/node_image_and_video_upload): upload stream dari server.
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference): public ID, destroy, dan invalidation.
