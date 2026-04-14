
Tujuan: memperbaiki error `/login` yang memicu `Maximum update depth exceeded` dan membuat flow auth stabil dengan backend `POST /api/login`.

Rangkuman masalah yang saya temukan:
- `LoginPage` menganggap user sudah login hanya dari `sessionStorage.getItem("scimonitor_auth") === "true"`.
- `PasswordGate` mengecek dua hal: flag `scimonitor_auth` dan token dari `getAuthToken()`.
- Kalau flag masih `true` tetapi token kosong/expired, maka terjadi loop:
```text
/login -> LoginPage redirect ke /dashboard
/dashboard -> PasswordGate redirect balik ke /login
ulang terus -> maximum update depth / throttling navigation
```
- Penyebab utama: ada 2 sumber status login yang tidak sinkron. Token dan flag boolean seharusnya tidak dipisah.

Rencana perbaikan:
1. Jadikan token sebagai single source of truth
   - Hapus ketergantungan pada `scimonitor_auth` untuk menentukan status login.
   - Buat helper auth yang konsisten, misalnya `isAuthenticated()` berbasis `Boolean(sessionStorage token)` / `Boolean(getAuthToken())`.
   - `LoginPage`, `PasswordGate`, dan logout semua memakai helper yang sama.

2. Rapikan flow login
   - Setelah `POST /api/login` sukses:
     - simpan token
     - redirect ke `/dashboard`
   - Jangan simpan flag auth terpisah lagi, karena token saja sudah cukup.

3. Perbaiki guard di `/login`
   - `LoginPage` hanya redirect ke `/dashboard` jika token valid/ada.
   - Jika token tidak ada, halaman login harus tetap render normal tanpa redirect apa pun.

4. Perbaiki guard route protected
   - `PasswordGate` hanya cek helper auth yang sama.
   - Bila tidak ada token, redirect ke `/login`.

5. Rapikan penanganan 401
   - Saat request protected mendapat `401`, clear token/auth state lalu arahkan ke `/login`.
   - Pastikan redirect ini tidak meninggalkan state lama yang memicu loop lagi.
   - Jika perlu, sederhanakan `window.location.href` handling agar tidak bentrok dengan router state.

6. Verifikasi area yang terdampak
   - `/login` bisa dibuka langsung
   - tombol “Login Admin” di `/` masuk ke `/login`
   - login sukses masuk ke `/dashboard`
   - logout kembali ke `/login`
   - akses `/dashboard`, `/targets`, `/pings`, `/correlation` tanpa token selalu dilempar ke `/login`
   - submit survey tetap public tanpa token
   - tidak menampilkan riwayat survey tetap dipertahankan

Detail teknis:
- File yang kemungkinan diubah:
  - `src/lib/api.ts`
  - `src/pages/LoginPage.tsx`
  - `src/components/PasswordGate.tsx`
  - kemungkinan kecil `src/components/AppSidebar.tsx`
- Pendekatan yang paling aman:
```text
Auth state = ada token
Bukan = ada token + flag tambahan
```
- Ini akan menghilangkan mismatch state yang sekarang menjadi akar redirect loop.

Hasil yang diharapkan setelah implementasi:
- `/login` tidak loop lagi
- warning navigasi berulang hilang
- auth flow lebih sederhana dan stabil
- semua endpoint protected tetap memakai Bearer token sesuai spec backend
