/**
 * Ekstraksi teks dari file PDF menggunakan pdfjs-dist.
 * Dijalankan di sisi server (Next.js API route).
 */

const MAX_CHARS = 15000;

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Nonaktifkan worker karena berjalan di server Node.js
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const textParts: string[] = [];
  let totalChars = 0;

  for (let i = 1; i <= numPages; i++) {
    if (totalChars >= MAX_CHARS) break;

    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      textParts.push(pageText);
      totalChars += pageText.length;
    }
  }

  const fullText = textParts.join("\n\n").trim();

  if (!fullText) {
    throw new Error("no_text");
  }

  return fullText.length > MAX_CHARS
    ? fullText.slice(0, MAX_CHARS)
    : fullText;
}
