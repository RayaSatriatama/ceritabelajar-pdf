/**
 * Test: lib/generateStory.ts
 *
 * Pengujian intensif satu agen AI menggunakan OpenRouter API nyata.
 * Memverifikasi output, faithfulness, dan format JSON.
 */

import { generateStory } from "../lib/generateStory";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

// Teks PDF materi sekolah untuk pengujian
const PDF_TEXT_SIKLUS_AIR = `
Siklus Air (Hidrologi)

Siklus air adalah proses alami yang terus berulang di mana air bergerak melalui atmosfer, daratan, dan lautan. 
Proses ini terdiri dari beberapa tahapan utama:

1. Evaporasi: Panas matahari menyebabkan air dari laut, danau, dan sungai menguap menjadi uap air.
   Sekitar 86% evaporasi terjadi dari permukaan laut.

2. Transpirasi: Tumbuhan melepaskan uap air melalui stomata pada daun mereka.
   Proses evaporasi dan transpirasi bersama disebut evapotranspirasi.

3. Kondensasi: Uap air naik ke atmosfer dan mendingin, berubah menjadi tetes-tetes air kecil
   yang membentuk awan dan kabut.

4. Presipitasi: Air jatuh kembali ke bumi dalam bentuk hujan, salju, atau hujan es.
   Rata-rata curah hujan global adalah 990 mm per tahun.

5. Infiltrasi: Sebagian air meresap ke dalam tanah dan menjadi air tanah.

6. Aliran permukaan (Runoff): Air mengalir di permukaan tanah menuju sungai dan kembali ke laut.

Siklus air sangat penting bagi kehidupan karena mendistribusikan air bersih ke seluruh planet.
`.trim();

const PDF_TEXT_FOTOSINTESIS = `
Fotosintesis pada Tumbuhan

Fotosintesis adalah proses di mana tumbuhan mengubah energi cahaya matahari menjadi energi kimia
yang tersimpan dalam bentuk glukosa (gula).

Persamaan reaksi fotosintesis:
6CO2 + 6H2O + energi cahaya -> C6H12O6 + 6O2

Komponen yang diperlukan:
- Klorofil: pigmen hijau yang menyerap cahaya matahari
- Air (H2O): diserap oleh akar dari tanah
- Karbon dioksida (CO2): diserap dari udara melalui stomata

Dua tahap utama fotosintesis:
1. Reaksi terang (di tilakoid): Mengubah energi cahaya menjadi ATP dan NADPH
2. Siklus Calvin (di stroma): Menggunakan ATP dan NADPH untuk membuat glukosa dari CO2

Hasil fotosintesis:
- Glukosa untuk energi tumbuhan
- Oksigen dilepaskan ke udara sebagai produk sampingan
`.trim();

const skipIfNoKey = OPENROUTER_KEY ? describe : describe.skip;

describe("generateStory - validasi parameter", () => {
  it("harus gagal jika OPENROUTER_API_KEY tidak ada", async () => {
    const originalKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;

    await expect(
      generateStory("teks pdf", "", "short", "test.pdf")
    ).rejects.toThrow("OPENROUTER_API_KEY");

    process.env.OPENROUTER_API_KEY = originalKey;
  });
});

skipIfNoKey("generateStory - cerita singkat (integrasi API nyata)", () => {
  it("harus menghasilkan cerita singkat dengan title dan story", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "materi-siklus-air.pdf"
    );

    console.log("\n=== CERITA SINGKAT - SIKLUS AIR ===");
    console.log(`Judul: ${result.title}`);
    console.log(`Isi (${result.story.split(" ").length} kata):\n${result.story}`);
    console.log("===================================\n");

    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    expect(result.title.length).toBeGreaterThan(3);
    expect(result.story).toBeTruthy();
    expect(result.sourceFile).toBe("materi-siklus-air.pdf");
    expect(result.length).toBe("short");
  }, 60000);

  it("hasil cerita singkat harus dalam bahasa Indonesia", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    // Cek kata-kata umum bahasa Indonesia
    const indonesianWords = ["dan", "yang", "di", "ke", "dari", "ini", "itu", "dengan", "untuk", "pada"];
    const storyLower = result.story.toLowerCase();
    const foundWords = indonesianWords.filter((w) => storyLower.includes(w));

    expect(foundWords.length).toBeGreaterThanOrEqual(3);
    console.log(`[OK] Kata Indonesia ditemukan: ${foundWords.join(", ")}`);
  }, 60000);

  it("cerita singkat harus memiliki panjang wajar (150-500 kata)", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    const wordCount = result.story.trim().split(/\s+/).length;
    console.log(`[OK] Panjang cerita singkat: ${wordCount} kata`);

    expect(wordCount).toBeGreaterThanOrEqual(150);
    expect(wordCount).toBeLessThanOrEqual(500);
  }, 60000);
});

skipIfNoKey("generateStory - cerita medium (integrasi API nyata)", () => {
  it("harus menghasilkan cerita medium dengan title dan story", async () => {
    const result = await generateStory(
      PDF_TEXT_FOTOSINTESIS,
      "",
      "medium",
      "materi-fotosintesis.pdf"
    );

    console.log("\n=== CERITA MEDIUM - FOTOSINTESIS ===");
    console.log(`Judul: ${result.title}`);
    console.log(`Isi (${result.story.split(" ").length} kata):\n${result.story}`);
    console.log("====================================\n");

    expect(result).toBeDefined();
    expect(result.title).toBeTruthy();
    expect(result.story).toBeTruthy();
    expect(result.sourceFile).toBe("materi-fotosintesis.pdf");
    expect(result.length).toBe("medium");
  }, 60000);

  it("cerita medium harus lebih panjang dari cerita singkat", async () => {
    const [shortResult, mediumResult] = await Promise.all([
      generateStory(PDF_TEXT_SIKLUS_AIR, "", "short", "test.pdf"),
      generateStory(PDF_TEXT_SIKLUS_AIR, "", "medium", "test.pdf"),
    ]);

    const shortWords = shortResult.story.trim().split(/\s+/).length;
    const mediumWords = mediumResult.story.trim().split(/\s+/).length;

    console.log(`[OK] Singkat: ${shortWords} kata | Medium: ${mediumWords} kata`);
    expect(mediumWords).toBeGreaterThan(shortWords);
  }, 120000);

  it("cerita medium harus memiliki panjang wajar (300-700 kata)", async () => {
    const result = await generateStory(
      PDF_TEXT_FOTOSINTESIS,
      "",
      "medium",
      "test.pdf"
    );

    const wordCount = result.story.trim().split(/\s+/).length;
    console.log(`[OK] Panjang cerita medium: ${wordCount} kata`);

    expect(wordCount).toBeGreaterThanOrEqual(300);
    expect(wordCount).toBeLessThanOrEqual(700);
  }, 60000);
});

skipIfNoKey("generateStory - fitur fokus cerita", () => {
  it("harus menghasilkan cerita yang fokus pada topik yang diberikan", async () => {
    const focus = "proses evaporasi dan kondensasi";
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      focus,
      "short",
      "test.pdf"
    );

    console.log("\n=== CERITA DENGAN FOKUS ===");
    console.log(`Fokus: ${focus}`);
    console.log(`Judul: ${result.title}`);
    console.log(`Isi:\n${result.story}`);
    console.log("==========================\n");

    const storyLower = result.story.toLowerCase();
    const hasFocusContent =
      storyLower.includes("evaporasi") ||
      storyLower.includes("kondensasi") ||
      storyLower.includes("menguap") ||
      storyLower.includes("uap");

    expect(hasFocusContent).toBe(true);
  }, 60000);

  it("tanpa fokus harus menghasilkan cerita dari gagasan utama PDF", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    expect(result.story.length).toBeGreaterThan(100);
    expect(result.title.length).toBeGreaterThan(3);
  }, 60000);
});

skipIfNoKey("generateStory - faithfulness (tidak boleh menambah fakta di luar PDF)", () => {
  it("tidak boleh menyebut informasi yang tidak ada dalam PDF source", async () => {
    // PDF hanya tentang siklus air - jangan ada biologi sel, DNA, dsb
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    const storyLower = result.story.toLowerCase();
    const offTopicTerms = ["dna", "rna", "ribosom", "mitokondria", "nukleus"];
    const foundOffTopic = offTopicTerms.filter((t) => storyLower.includes(t));

    console.log(`[OK] Faithfulness check - off-topic terms: ${foundOffTopic.join(", ") || "tidak ada"}`);
    expect(foundOffTopic.length).toBe(0);
  }, 60000);

  it("harus mengandung kata kunci dari materi PDF", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    const storyLower = result.story.toLowerCase();
    const keywords = ["air", "hujan", "awan", "uap", "bumi", "laut", "sungai"];
    const foundKeywords = keywords.filter((k) => storyLower.includes(k));

    console.log(`[OK] Kata kunci PDF ditemukan: ${foundKeywords.join(", ")}`);
    expect(foundKeywords.length).toBeGreaterThanOrEqual(2);
  }, 60000);
});

skipIfNoKey("generateStory - struktur output", () => {
  it("output harus memiliki semua field yang dibutuhkan", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "my-pdf.pdf"
    );

    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("story");
    expect(result).toHaveProperty("sourceFile");
    expect(result).toHaveProperty("length");
    expect(typeof result.title).toBe("string");
    expect(typeof result.story).toBe("string");
    expect(result.sourceFile).toBe("my-pdf.pdf");
    expect(["short", "medium"]).toContain(result.length);
  }, 60000);

  it("title tidak boleh kosong atau hanya whitespace", async () => {
    const result = await generateStory(
      PDF_TEXT_FOTOSINTESIS,
      "",
      "short",
      "test.pdf"
    );

    expect(result.title.trim().length).toBeGreaterThan(0);
    expect(result.title).not.toBe("undefined");
    expect(result.title).not.toBe("null");
  }, 60000);

  it("story harus memiliki minimal satu paragraf", async () => {
    const result = await generateStory(
      PDF_TEXT_SIKLUS_AIR,
      "",
      "short",
      "test.pdf"
    );

    const paragraphs = result.story.split(/\n\n+/).filter((p) => p.trim().length > 0);
    expect(paragraphs.length).toBeGreaterThanOrEqual(1);
  }, 60000);
});
