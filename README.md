# CeritaBelajar PDF 📚

> ⚠️ **PENGUMUMAN PENTING (DEPLOYMENT)**
> 
> Dikarenakan *outage* (gangguan) pada Vercel dan masalah kompatibilitas Turbopack, aplikasi ini untuk sementara dialihkan pengembangannya menggunakan **Netlify**.
> 
> 🌐 **Link Aplikasi Aktif (Netlify):**
> [https://agent-6a61ba54202ceda556d2902--ceritabelajar-pdf.netlify.app/](https://agent-6a61ba54202ceda556d2902--ceritabelajar-pdf.netlify.app/)

Ubah materi PDF menjadi cerita edukatif yang mudah dipahami (menggunakan agen AI).

Aplikasi ini membaca PDF secara statis di sisi server (via `pdfjs-dist`), dan memanfaatkan **satu agen AI** (via OpenRouter `deepseek/deepseek-v4-flash`) untuk menyusun cerita dengan aturan fakta yang ketat berdasarkan input teks dari dokumen aslinya.

## 🚀 Fitur Utama

- **Upload PDF:** Drag & drop dokumen materi (maksimal 10 MB).
- **Fokus Cerita:** Opsional menentukan topik tertentu di dalam dokumen untuk difokuskan.
- **Panjang Cerita:** 
  - **Singkat:** 2-3 menit (250-350 kata)
  - **Medium:** 4-5 menit (400-600 kata)
- **Ekstraksi Text Server-side:** Memanfaatkan build legacy dari `pdfjs-dist` langsung dari Edge/Node.js API Route.
- **Akurasi Fakta:** Agen diperintahkan untuk hanya menggunakan informasi yang ada dari PDF source, tanpa menambah klaim tidak berdasar.

## 🛠️ Stack Teknologi

- **Framework:** Next.js 16 (App Router) dengan TypeScript.
- **Styling:** Tailwind CSS v4 + Vanilla CSS custom properties.
- **AI / LLM:** OpenRouter API (`deepseek/deepseek-v4-flash`).
- **PDF Parser:** `pdfjs-dist` (legacy).
- **Testing:** Jest + `ts-jest` + RTL.

## 📁 Struktur Proyek (Ringkasan)

```bash
ceritabelajar-pdf/
├── app/
│   ├── api/generate/route.ts   # Endpoint utama (PDF -> Text -> AI -> Story)
│   ├── layout.tsx              # Font "Plus Jakarta Sans" & Metadata
│   ├── page.tsx                # Halaman utama (SPA) dengan state machine UI
│   └── globals.css             # Design System tokens & custom CSS
├── components/                 # Komponen UI (Uploader, Loading, Story, dll)
├── lib/
│   ├── extractPdfText.ts       # Logika ekstraksi PDF
│   └── generateStory.ts        # Client OpenRouter (OpenAI-compatible)
├── tests/                      # Suite pengujian unit dan integrasi
└── docs/                       # PRD & Dokumen desain
```

## ⚙️ Menjalankan Secara Lokal

1. **Clone repository ini** (jika belum).
2. **Install dependensi:**
   ```bash
   npm install
   ```
3. **Konfigurasi Environment Variable:**
   Buat file `.env` (atau salin dari `.env.local.example`):
   ```bash
   OPENROUTER_API_KEY=your_api_key_here
   ```
4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) dengan browser Anda.

## 🧪 Testing

Aplikasi ini menggunakan Jest untuk pengujian ekstensif.

Menjalankan **seluruh test** (unit & integrasi via mock & HTTP fetch):
```bash
npm run test
```

Menjalankan **hanya Unit Test** (tanpa memanggil API asli):
```bash
npm run test:unit
```

Menjalankan **Integration Test** (wajib ada `OPENROUTER_API_KEY` dan server yang sedang berjalan di `localhost:3000`):
```bash
npm run test:integration
```

## 📄 Dokumentasi Tambahan

Dokumen *Product Requirements Document (PRD)* beserta petunjuk *UI/UX* dapat ditemukan di folder `docs/`:
- `PRD_MVP_CeritaBelajar.md`
- `PRD_UIUX_CeritaBelajar_PDF.md`
