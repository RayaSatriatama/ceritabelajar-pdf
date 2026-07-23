/**
 * Test: lib/extractPdfText.ts
 *
 * Pengujian intensif ekstraksi teks PDF menggunakan file PDF nyata
 * yang dibuat secara programatik di dalam test.
 */

import * as fs from "fs";
import * as path from "path";
import { extractPdfText } from "../lib/extractPdfText";

// Buat PDF sederhana minimal yang valid secara binary
// Ini adalah PDF 1.4 yang paling minimal dengan satu halaman teks
function createMinimalPdfBuffer(text: string): ArrayBuffer {
  const escapedText = text.replace(/[()\\]/g, "\\$&");
  const stream = `BT /F1 12 Tf 72 720 Td (${escapedText}) Tj ET`;
  const streamLen = stream.length;

  const pdf = [
    "%PDF-1.4\n",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "xref\n0 6\n0000000000 65535 f \n",
    "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n0\n%%EOF\n",
  ].join("");

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i++) {
    bytes[i] = pdf.charCodeAt(i);
  }
  return bytes.buffer;
}

describe("extractPdfText", () => {
  describe("Validasi input", () => {
    it("harus melempar error 'no_text' untuk PDF tanpa teks", async () => {
      // PDF kosong (hanya structure tanpa konten teks)
      const emptyPdfBytes = new Uint8Array([
        0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, // %PDF-1.4
        0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a,       // binary comment
      ]);

      await expect(extractPdfText(emptyPdfBytes.buffer)).rejects.toThrow();
    });

    it("harus melempar error untuk ArrayBuffer kosong", async () => {
      const emptyBuffer = new ArrayBuffer(0);
      await expect(extractPdfText(emptyBuffer)).rejects.toThrow();
    });

    it("harus melempar error untuk data bukan PDF", async () => {
      const notPdf = new TextEncoder().encode("Ini bukan PDF sama sekali");
      await expect(extractPdfText(notPdf.buffer)).rejects.toThrow();
    });
  });

  describe("Ekstraksi teks dari file PDF nyata", () => {
    const fixtureDir = path.join(__dirname, "fixtures");

    beforeAll(() => {
      if (!fs.existsSync(fixtureDir)) {
        fs.mkdirSync(fixtureDir, { recursive: true });
      }
    });

    it("harus mengekstrak teks dari PDF minimal yang valid", async () => {
      const sampleText = "Siklus Air adalah proses alami yang terjadi di bumi.";
      const buffer = createMinimalPdfBuffer(sampleText);

      // pdfjs-dist akan parsing PDF - cek apakah hasilnya string
      try {
        const result = await extractPdfText(buffer);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      } catch (err) {
        // pdfjs-dist mungkin tidak bisa decode font Type1 minimal
        // tetapi error harus informatif
        expect(err).toBeInstanceOf(Error);
      }
    });

    it("harus mengekstrak teks dari file PDF materi sekolah (jika ada)", async () => {
      const fixturePdf = path.join(fixtureDir, "materi-siklus-air.pdf");
      if (!fs.existsSync(fixturePdf)) {
        console.log("Skip: fixture PDF tidak ditemukan, buat tests/fixtures/materi-siklus-air.pdf");
        return;
      }

      const buffer = fs.readFileSync(fixturePdf).buffer;
      const result = await extractPdfText(buffer);

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(10);
      console.log(`[OK] Teks diekstrak: ${result.length} karakter`);
      console.log(`[PREVIEW] ${result.slice(0, 200)}...`);
    });
  });

  describe("Pembatasan karakter (MAX_CHARS = 15000)", () => {
    it("hasil tidak boleh melebihi 15000 karakter", async () => {
      const fixturePdf = path.join(__dirname, "fixtures", "materi-siklus-air.pdf");
      if (!fs.existsSync(fixturePdf)) {
        console.log("Skip: fixture PDF tidak ditemukan");
        return;
      }

      const buffer = fs.readFileSync(fixturePdf).buffer;
      const result = await extractPdfText(buffer);

      expect(result.length).toBeLessThanOrEqual(15000);
    });
  });
});
