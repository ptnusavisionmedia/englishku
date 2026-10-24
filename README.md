# EnglishKu

Aplikasi belajar bahasa Inggris untuk anak usia 4–10 tahun: kartu kata, pengucapan, listening, 6 permainan singkat tanpa timer, bintang, badge, streak, koleksi kata, dan Mode Orang Tua.

**Aplikasi ini sekarang memakai database SQLite lokal (`expo-sqlite`). Tidak memerlukan Supabase, server, email, maupun internet.** Login memakai username dan password, dan semua data tersimpan di HP masing-masing.

Stack: Expo SDK 57, React Native 0.86, TypeScript, Expo Router, Zustand, `expo-sqlite`, `expo-crypto`, EAS Build, EAS Update.

## Fitur

- **Akun lokal**: daftar (username, password, nama panggilan, usia 4–6 / 7–10, avatar), login, logout, sesi dipulihkan saat aplikasi dibuka.
- **Onboarding**: memilih target belajar harian (5/10/15 menit).
- **Beranda, jalur belajar (10 tema), kartu kata, latihan ucapan, 6 game, reward, koleksi kata, profil, Mode Orang Tua** (gerbang soal matematika, ringkasan, progres mingguan, batas waktu harian).
- Pengucapan memakai suara perangkat (`expo-speech`); latihan rekam memakai `expo-audio` dengan persetujuan orang tua, rekaman tidak disimpan. **Penilaian pengucapan masih simulasi** (lihat `components/learning/PronunciationPanel.tsx`).
- Pengaturan **musik** dan **pengingat** hanya tersimpan sebagai preferensi (belum ada file musik/notifikasi).

## Desain: neo-brutalism ala logo EnglishKu

- **Gaya**: kartun mengilap (glossy) seperti ilustrasinya. Tombol, kapsul, panel, dan bilah progres berbentuk "permen": warna cerah, kilau putih di atas, dan alas lebih gelap di bawah yang tertekan saat disentuh. Tiap tab punya header berwarna dengan sudut membulat, daftar datar dengan garis pemisah tipis, dan jalur belajar berbentuk garis waktu bernomor.
- **Geser antar halaman**: di area anak (Beranda, Belajar, Bermain, Koleksi, Profil) dan Mode Orang Tua, geser jari ke kiri atau kanan untuk pindah halaman; ketuk bilah bawah tetap bisa. Di kartu kata, geser untuk kata berikutnya atau sebelumnya (`components/layout/SwipeNav.tsx`, `hooks/useSwipe.ts`). Halaman berpindah setelah geseran selesai, bukan mengikuti jari.
- **Warna**: biru, merah, oranye, dan hijau muda di atas latar biru langit yang sangat terang. Tidak ada warna hitam atau gelap, dan hanya ada satu tema terang. Semua warna ada di `constants/theme.ts`; efek mengilap ada di `components/ui/Brutal.tsx` (nama file lama; isinya kini tombol dan panel "permen").
- **Font** (dibundel di aplikasi, tidak butuh internet): **Lilita One** untuk judul dan tombol (bulat tebal seperti huruf logo) dan **Baloo 2** untuk teks (ramah dan mudah dibaca anak). Dimuat di `app/_layout.tsx`; komponen `components/ui/Text.tsx` memetakan `fontWeight` ke file font yang sesuai.
- **Layar pembuka beranimasi**: sinar berputar di belakang logo yang memantul masuk, bergoyang, dan melayang; stiker (bintang, roket, ABC, hati) muncul di sekelilingnya, gelembung warna melayang, konfeti turun, tulisan "Belajar English itu seru!" muncul, dan bilah progres mengilap terisi. Tampil minimal sekitar 2,6 detik sambil font, database, dan sesi dimuat, lalu memudar (`components/layout/AnimatedSplash.tsx`).
- **Transisi halaman halus**: perpindahan tab memudar dan bergeser lembut selama sekitar 0,3 detik (`constants/tabTransition.ts`), halaman baru memudar naik dari bawah, dan tombol tab melompat dengan pegas tanpa efek riak atau lapisan gelap (`components/layout/TabParts.tsx`). Aplikasi dipaksa memakai tema terang (`Appearance.setColorScheme` dan `ThemeProvider` di `app/_layout.tsx`), sehingga HP bermode gelap tidak lagi memunculkan kilatan hitam di belakang halaman.
- **Badge**: Koleksi punya tombol **Badge** tepat di sebelah **Favorit**. Isinya semua badge: yang sudah didapat tampil dengan gambar, nama, dan deskripsinya, sedangkan yang belum didapat hanya tampil sebagai tanda tanya. Ketuk badge yang sudah didapat untuk memasangnya (maksimal 3). Di **Profil** bagian "Badge di Beranda" ada 3 slot untuk memilih, mengganti, atau mengosongkan badge. Badge yang dipasang tampil di bawah nama di Beranda. Pilihan disimpan di database (kolom `profiles.pinned_badges`, migration versi 2, aman untuk data lama).
- **Ikon**: 147 ilustrasi PNG kartun mengilap buatan Anda di `assets/icons/` (kata, tema, avatar, badge, dan ikon antarmuka), dipakai lewat `components/ui/Icon.tsx`. Daftar `require`-nya dibuat oleh `npm run icons:generate` (`scripts/generate-icons.js`) menjadi `lib/icons/icon-images.ts`; jalankan lagi setelah menambah atau mengganti file. Nama file: `word-<kata>`, `cat-<tema>`, `avatar-<kunci>`, `badge-<nama>`. Kata tanpa ikon menampilkan `question.png`.
  - Gambar kata: `word-<kata>` (mis. `word-teddy-bear`), tema: `cat-<tema>`, avatar: `avatar-<kunci>`, badge: `badge-<nama>`.
  - Menambah kata baru: tambahkan ikon `word-<kata>` di `scripts/generate-icons.js`; jika belum ada, aplikasi menampilkan ikon tanda tanya.
- **Animasi** (React Native `Animated`, hormati pengaturan "kurangi gerakan"): tombol menekan lalu memantul, kartu dan daftar muncul bertahap, ikon tab melompat saat dipilih, tombol "Mulai Belajar" berdenyut, gambar tema dan logo bisa diketuk (melompat dan bergoyang), jawaban benar memantul dan salah bergetar, konfeti dan bintang satu per satu saat menang, bilah progres terisi dengan efek pegas, dan rekaman berdenyut.
- **Efek suara**: 19 efek kartun disintesis oleh `scripts/generate-sounds.js` dan disimpan di `assets/sounds/*.wav` (jalankan `npm run sounds:generate` untuk membuat ulang). Dimainkan lewat `lib/sounds` (`expo-audio`) pada: ketukan tombol, pindah tab dan geser halaman, tombol kembali, saklar, favorit (hati), jawaban benar dan salah (nada lembut, tidak menakutkan), pasangan cocok, kartu terbuka, huruf ejaan, bintang, kemenangan, badge baru, mulai dan berhenti merekam, layar pembuka, dan keluar akun. Efek ini mengikuti pengaturan **Suara** (Profil atau Mode Orang Tua); jika dimatikan, semuanya diam.
- **Ganti akun**: di Profil ada **Ganti Akun**, **Buat Akun Baru**, dan **Keluar** (masing-masing meminta konfirmasi, lalu membuka layar login atau daftar). Keluar akun juga ada di Mode Orang Tua. Data tiap akun tersimpan terpisah di HP.

## Menjalankan (Expo Go SDK 57)

Project memakai **Expo SDK 57** (`expo ~57.0.31`, React Native 0.86.3). Pasang Expo Go yang mendukung SDK 57 (<https://expo.dev/go>).

```bash
npm install
npx expo start            # scan QR dengan Expo Go
npx expo start --clear    # bersihkan cache Metro
npx expo start --tunnel   # jika ponsel dan komputer beda jaringan
npx expo doctor           # periksa konfigurasi dan versi dependency
```

Tidak ada file `.env` atau environment variable yang dibutuhkan. Jika folder Anda masih punya `.env` lama berisi variabel Supabase, file itu tidak dipakai lagi dan boleh dihapus.

`.npmrc` berisi `legacy-peer-deps=true` karena konflik peer dependency `react-dom` pada ekosistem Expo.

## Akun

- **Membuat akun baru**: di layar login ketuk **Daftar**, isi username (min. 3 karakter; huruf, angka, `_`, `.`), password (min. 6 karakter), nama panggilan, usia, dan avatar. Lalu pilih target harian.
- **Lupa password**: tidak bisa dipulihkan (tidak ada email/server). Buat akun baru.

### Keamanan password

Password **tidak pernah disimpan sebagai teks biasa**. Setiap akun memakai salt acak 16 byte, dan password di-hash dengan SHA-256 berulang (600 putaran) lewat `expo-crypto` (`lib/auth/password.ts`). Sesi lokal hanya menyimpan ID user di AsyncStorage, bukan password. Password tidak dicetak ke log.

**Keterbatasan:** Expo Go tidak punya bcrypt/scrypt/PBKDF2 bawaan, jadi skema ini lebih lemah daripada bcrypt/argon2. Hasil hash diberi awalan versi (`v1$`) sehingga skema yang lebih kuat bisa ditambahkan nanti tanpa merusak akun lama. Risikonya terbatas karena database hanya ada di HP pemiliknya.

## Database SQLite

File database `englishku.db` tersimpan di penyimpanan privat aplikasi di HP.

```
lib/database/   db.ts (buka DB), migrations.ts (versi skema), seed.ts, content.ts (kurikulum), types.ts
lib/auth/       password.ts (salt + hash), local-auth.ts (sesi lokal)
services/       local-auth, local-profile, local-lesson, local-vocabulary, local-progress, local-achievement
```

### Skema

Tabel: `users`, `profiles`, `categories`, `lessons`, `vocabulary`, `user_progress`, `user_vocabulary`, `achievements`, `user_achievements`, ditambah `app_meta` (menyimpan versi kurikulum yang sudah di-seed). Definisi lengkap ada di `lib/database/migrations.ts`. Kolom penting:

- `users(id, username UNIQUE NOCASE, password_hash, password_salt, ...)`
- `profiles(user_id UNIQUE, display_name, age_group '4-6'|'7-10', avatar, daily_goal_minutes, total_stars, current_streak, last_active_date, ...)`
- `user_progress(user_id, lesson_id, status, score, completed_at)` UNIQUE per (user, lesson)
- `user_vocabulary(user_id, vocabulary_id, is_favorite, mastery_level, ...)` UNIQUE per (user, vocab)
- `user_achievements(user_id, achievement_id)` UNIQUE per (user, badge)

### Cara kerja migration

- Versi skema disimpan di `PRAGMA user_version`. Saat aplikasi dibuka, `runMigrations` menjalankan migration yang lebih baru secara berurutan di dalam transaksi.
- Database dibuat otomatis saat aplikasi pertama kali dibuka, lalu di-seed (kategori, lesson, vocabulary, achievement).
- Seed memakai upsert berdasarkan id, jadi **tidak menggandakan data**. Konten hanya di-seed ulang bila `CONTENT_VERSION` di `lib/database/seed.ts` berubah. Data user tidak pernah disentuh.
- **Mengubah struktur database**: jangan edit migration lama. Tambahkan objek baru di akhir daftar `migrations` (mis. `version: 2` dengan `ALTER TABLE ... ADD COLUMN`). Jangan memakai `DROP TABLE` pada data user.
- **Menambah konten** (lesson/kata/badge): edit `lib/database/content.ts`, naikkan `CONTENT_VERSION`, lalu kirim EAS Update.

### Reset database saat development

Di Expo Go: hapus data aplikasi lewat pengaturan Expo Go, atau gunakan `resetDatabaseForDevelopment()` dari `lib/database/db.ts` (hanya jalan saat `__DEV__`). Ini menghapus **semua** akun dan progres di perangkat itu. Di APK terpasang: hapus data/aplikasi dari pengaturan Android.

## Membuat APK / AAB

```bash
npm i -g eas-cli
eas login
eas whoami
eas init
```

Ganti `com.yourcompany.englishku` (Android `package` dan iOS `bundleIdentifier`) di `app.json` dengan milik Anda sebelum build yang akan dirilis.

| Profil           | Hasil          | Channel       | Untuk                            |
| ---------------- | -------------- | ------------- | -------------------------------- |
| `development`    | APK dev client | `development` | Development dengan native module |
| `preview`        | APK            | `preview`     | Uji internal                     |
| `production-apk` | APK            | `production`  | Dipasang langsung di HP          |
| `production`     | AAB            | `production`  | Upload ke Google Play            |

```bash
eas build --platform android --profile production-apk   # APK
eas build --platform android --profile production       # AAB
```

Tidak ada environment variable yang perlu didaftarkan di EAS (tidak ada lagi Supabase). Unduh APK dari link/QR hasil build, buka di HP, dan pilih **Install** (izinkan "Instal dari sumber tidak dikenal" bila diminta).

Untuk upload ke store: Google Play (AAB + `eas submit --platform android --profile production`, dengan `google-service-account.json` yang sudah di-gitignore) dan App Store (`eas submit --platform ios --profile production`; isi `ascAppId` di `eas.json`). Untuk aplikasi anak, lengkapi formulir Families/Kids dan kebijakan privasi.

## EAS Update (OTA)

```bash
eas update:configure     # sekali saja
eas update --channel production --message "Migrasi ke SQLite lokal"
```

`runtimeVersion` memakai policy `appVersion`: update hanya sampai ke build dengan `version` (di `app.json`) yang sama. Aplikasi mengunduh update di latar belakang dan memakainya pada pembukaan berikutnya.

- **Data SQLite tersimpan di HP dan tidak dihapus oleh EAS Update.** Update hanya mengganti kode JavaScript, UI, styling, dan aset.
- Perubahan skema database harus lewat **migration baru** (lihat di atas); migration berjalan otomatis saat aplikasi dibuka setelah update.
- **Wajib build APK/AAB baru**: native dependency baru (atau yang berubah versinya), permission baru, native code, konfigurasi Android/iOS di `app.json`, dan perubahan runtime (naikkan `version`).
- **Perhatian**: APK lama (yang masih memakai Supabase) tidak kompatibel dengan versi ini. Update ini membawa dependency native baru (`expo-sqlite`, `expo-crypto`), sehingga **perlu build APK baru** sebelum update OTA berikutnya bisa dipakai.

Memastikan perangkat memakai channel production: `eas channel:view production`, `eas update:list --branch production`; build `production-apk`/`production` otomatis membawa channel `production`.

## Keterbatasan data lokal

- Data **tidak tersinkron antar-perangkat**. Akun di satu HP tidak ada di HP lain.
- Jika aplikasi **dihapus** (atau datanya dibersihkan), database lokal ikut hilang.
- Password tidak bisa dipulihkan.
- Waktu belajar harian dicatat di perangkat (AsyncStorage), terpisah dari database.
- Sinkronisasi atau cadangan di masa depan memerlukan backend baru.

## Quality check

```bash
npm run typecheck
npm run lint
npm run format:check
npx expo-doctor
```

## Struktur folder

```
app/           _layout, index, onboarding, modal, +not-found
  (auth)/      login, register
  (child)/     home, learn, games, collection, profile
  lesson/      [id], complete
  game/        [type], result
  parent/      index, progress, settings
components/    ui, learning, games, forms, layout, common
constants/  hooks/  lib/  services/  stores/  types/
supabase/      ARSIP versi lama (tidak diimpor aplikasi)
scripts/       generate-seed.js (arsip, untuk SQL Supabase lama)
```

Folder `supabase/` dan `scripts/generate-seed.js` hanya arsip dari versi sebelumnya; aplikasi tidak mengimpor atau memanggilnya.

## Troubleshooting

- **Layar "Database belum bisa dibuka"**: tutup aplikasi lain, lalu ketuk **Coba Lagi**. Jika berulang, hapus data aplikasi (akan menghapus akun lokal).
- **"Username atau password salah"**: periksa huruf besar/kecil password (username tidak membedakan huruf besar/kecil). Password tidak bisa dipulihkan.
- **Akun hilang setelah memasang ulang**: wajar, data lokal terhapus bersama aplikasi.
- **Error versi Expo Go**: pasang Expo Go SDK 57 dari <https://expo.dev/go>.
- **Cache aneh**: `npx expo start --clear`.
