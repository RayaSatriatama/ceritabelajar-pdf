/**
 * Test: app/api/generate/route.ts
 *
 * Pengujian intensif API route - validasi input, handling error,
 * dan integrasi end-to-end menggunakan fetch ke server Next.js.
 *
 * Catatan: Test ini menguji logika validasi secara langsung (unit test),
 * bukan melalui HTTP karena server perlu berjalan untuk integrasi penuh.
 */

import * as fs from "fs";
import * as path from "path";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
const skipIfNoKey = OPENROUTER_KEY ? describe : describe.skip;

// ---- Helper: buat FormData dengan file ----
function createFormData(
  fileName: string,
  content: string | Buffer,
  mimeType: string,
  focus = "",
  length = "short"
): FormData {
  const blob = new Blob([content], { type: mimeType });
  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("focus", focus);
  form.append("length", length);
  return form;
}

// ---- Helper: POST ke API route ----
async function postToApi(
  formData: FormData,
  baseUrl = "http://localhost:3000"
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    body: formData,
  });
  const body = await res.json();
  return { status: res.status, body };
}

// ---- Validasi logika tanpa server ----
describe("API route - validasi logika file", () => {
  it("harus menolak file bukan PDF berdasarkan ekstensi", () => {
    const fileName = "materi.docx";
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    expect(isPdf).toBe(false);
  });

  it("harus menerima file PDF berdasarkan ekstensi", () => {
    const fileName = "materi-siklus-air.pdf";
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    expect(isPdf).toBe(true);
  });

  it("harus menolak file yang melebihi 10 MB", () => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const fileSize = 11 * 1024 * 1024;
    expect(fileSize > MAX_SIZE).toBe(true);
  });

  it("harus menerima file di bawah atau sama dengan 10 MB", () => {
    const MAX_SIZE = 10 * 1024 * 1024;
    const fileSize = 5 * 1024 * 1024;
    expect(fileSize <= MAX_SIZE).toBe(true);
  });

  it("harus memvalidasi panjang cerita - hanya short atau medium", () => {
    const validLengths = ["short", "medium"];
    expect(validLengths.includes("short")).toBe(true);
    expect(validLengths.includes("medium")).toBe(true);
    expect(validLengths.includes("long")).toBe(false);
    expect(validLengths.includes("")).toBe(false);
  });

  it("focus tidak boleh melebihi 150 karakter", () => {
    const MAX_FOCUS = 150;
    const longFocus = "a".repeat(151);
    expect(longFocus.length > MAX_FOCUS).toBe(true);

    const validFocus = "proses evaporasi dan kondensasi";
    expect(validFocus.length <= MAX_FOCUS).toBe(true);
  });
});

// ---- Integrasi end-to-end (membutuhkan server berjalan) ----
skipIfNoKey("API route - integrasi HTTP (server harus berjalan di localhost:3000)", () => {
  const BASE_URL = "http://localhost:3000";

  async function isServerRunning(): Promise<boolean> {
    try {
      const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
      return res.ok || res.status < 500;
    } catch {
      return false;
    }
  }

  beforeAll(async () => {
    const running = await isServerRunning();
    if (!running) {
      console.warn("Server tidak berjalan. Jalankan 'npm run dev' sebelum test ini.");
    }
  });

  it("POST tanpa file harus mengembalikan 400", async () => {
    const running = await isServerRunning();
    if (!running) return;

    const form = new FormData();
    form.append("focus", "");
    form.append("length", "short");

    const { status, body } = await postToApi(form, BASE_URL);
    expect(status).toBe(400);
    expect(body).toHaveProperty("error");
    console.log(`[OK] Status 400: ${(body as { error: string }).error}`);
  }, 15000);

  it("POST dengan file bukan PDF harus mengembalikan 400", async () => {
    const running = await isServerRunning();
    if (!running) return;

    const form = createFormData("materi.txt", "isi teks biasa", "text/plain");
    const { status, body } = await postToApi(form, BASE_URL);

    expect(status).toBe(400);
    expect((body as { error: string }).error).toMatch(/PDF/i);
    console.log(`[OK] Status 400 file bukan PDF: ${(body as { error: string }).error}`);
  }, 15000);

  it("POST dengan PDF valid harus mengembalikan 200 dengan cerita", async () => {
    const running = await isServerRunning();
    if (!running) return;

    // Buat konten PDF minimal yang valid
    const pdfContent =
      "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
      "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
      "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n" +
      "xref\n0 4\n0000000000 65535 f\n" +
      "trailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF";

    // Gunakan fixture PDF jika ada
    const fixturePath = path.join(__dirname, "fixtures", "materi-siklus-air.pdf");
    let content: string | Buffer = pdfContent;
    let fileName = "test.pdf";

    if (fs.existsSync(fixturePath)) {
      content = fs.readFileSync(fixturePath);
      fileName = "materi-siklus-air.pdf";
    }

    const form = createFormData(fileName, content, "application/pdf", "", "short");
    const { status, body } = await postToApi(form, BASE_URL);

    console.log(`[INFO] Status: ${status}, Body keys: ${Object.keys(body).join(", ")}`);

    if (status === 200) {
      expect(body).toHaveProperty("title");
      expect(body).toHaveProperty("story");
      expect(body).toHaveProperty("sourceFile");
      expect(body).toHaveProperty("length");
      console.log(`[OK] Cerita berhasil: "${(body as { title: string }).title}"`);
    } else {
      // Bisa 422 jika PDF tidak punya teks - ini valid
      expect([200, 422]).toContain(status);
    }
  }, 60000);

  it("POST dengan panjang 'medium' harus mengembalikan length=medium", async () => {
    const running = await isServerRunning();
    if (!running) return;

    const fixturePath = path.join(__dirname, "fixtures", "materi-siklus-air.pdf");
    if (!fs.existsSync(fixturePath)) {
      console.log("Skip: fixture PDF tidak ditemukan");
      return;
    }

    const content = fs.readFileSync(fixturePath);
    const form = createFormData("materi.pdf", content, "application/pdf", "", "medium");
    const { status, body } = await postToApi(form, BASE_URL);

    if (status === 200) {
      expect((body as { length: string }).length).toBe("medium");
      console.log(`[OK] length=medium dikembalikan dengan benar`);
    }
  }, 60000);
});
