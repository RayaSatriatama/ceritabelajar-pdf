/**
 * Satu agen AI untuk mengubah teks PDF menjadi cerita edukatif.
 * Menggunakan OpenRouter (OpenAI-compatible) dengan model google/gemini-2.5-flash.
 * Referensi implementasi: thesis_result/src/providers/llm_factory.py (OpenRouter section)
 */

import OpenAI from "openai";
import type { StoryLength, StoryResponse } from "@/types/story";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const MODEL = "deepseek/deepseek-v4-flash";

function buildClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY tidak ditemukan di environment variables.");
  }
  return new OpenAI({
    apiKey,
    baseURL: OPENROUTER_BASE_URL,
    defaultHeaders: {
      "HTTP-Referer": "https://ceritabelajar.vercel.app",
      "X-Title": "CeritaBelajar PDF",
    },
  });
}

function buildSystemPrompt(): string {
  return `Anda adalah agen pembuat cerita edukatif untuk siswa SMP dan SMA.

ATURAN KESETIAAN FAKTA (WAJIB DIPATUHI):
- Gunakan HANYA informasi dari PDF_SOURCE yang diberikan.
- Jangan menambahkan fakta, angka, nama ilmiah, atau klaim yang tidak ada dalam PDF_SOURCE.
- Tokoh fiktif sederhana boleh dibuat untuk menyampaikan materi.
- Gunakan bahasa Indonesia yang jelas dan sesuai usia 11-17 tahun.
- Hindari istilah sulit; jika perlu jelaskan dalam kalimat sederhana.
- Gunakan kalimat aktif, deskripsi yang hidup, dan alur yang menarik.

PANJANG CERITA:
- singkat: 250-350 kata, satu tokoh utama, satu masalah, satu penyelesaian.
- medium: 400-600 kata, maksimal tiga tokoh, konteks dan penjelasan lebih luas.

TUGAS:
1. Baca dan pahami gagasan utama PDF_SOURCE.
2. Perhatikan FOKUS jika diberikan (arahkan cerita ke topik tersebut).
3. Buat cerita edukatif sesuai PANJANG_CERITA.
4. Kembalikan respons HANYA dalam format JSON berikut tanpa teks tambahan apapun:

{
  "title": "Judul cerita yang menarik",
  "story": "Isi cerita dalam beberapa paragraf, pisahkan paragraf dengan \\n\\n"
}`;
}

function buildUserPrompt(
  pdfText: string,
  focus: string,
  length: StoryLength
): string {
  const lengthLabel = length === "short" ? "singkat (250-350 kata)" : "medium (400-600 kata)";
  return `PDF_SOURCE:
${pdfText}

FOKUS (opsional):
${focus || "Tidak ada, gunakan gagasan utama PDF."}

PANJANG_CERITA: ${lengthLabel}`;
}

export async function generateStory(
  pdfText: string,
  focus: string,
  length: StoryLength,
  fileName: string
): Promise<StoryResponse> {
  const client = buildClient();

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.8,
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(pdfText, focus, length) },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";

  // Ambil blok JSON dari respons
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Respons agen tidak mengandung JSON yang valid.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { title: string; story: string };

  if (!parsed.title || !parsed.story) {
    throw new Error("Struktur JSON dari agen tidak lengkap.");
  }

  return {
    title: parsed.title,
    story: parsed.story,
    sourceFile: fileName,
    length,
  };
}
