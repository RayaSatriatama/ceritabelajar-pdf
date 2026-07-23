import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/lib/extractPdfText";
import { generateStory } from "@/lib/generateStory";
import type { StoryLength } from "@/types/story";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const focus = (formData.get("focus") as string) ?? "";
    const length = (formData.get("length") as StoryLength) ?? "short";

    // Validasi file
    if (!file) {
      return NextResponse.json(
        { error: "File PDF tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Hanya file PDF yang diterima." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran PDF melebihi 10 MB. Gunakan file yang lebih kecil." },
        { status: 400 }
      );
    }

    // Ekstraksi teks PDF
    const buffer = await file.arrayBuffer();
    let pdfText: string;
    try {
      pdfText = await extractPdfText(buffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "no_text") {
        return NextResponse.json(
          {
            error:
              "Teks PDF tidak terbaca. Gunakan PDF yang teksnya dapat dipilih, bukan hasil foto atau pindai.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "PDF tidak dapat dibuka. Periksa file atau gunakan PDF lain." },
        { status: 422 }
      );
    }

    // Satu agen AI membuat cerita
    const result = await generateStory(pdfText, focus, length, file.name);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[API/generate]", err);
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
