/**
 * Ekstraksi teks dari file PDF menggunakan pdf-parse.
 * Dijalankan di sisi server (Next.js API route).
 */

const MAX_CHARS = 15000;



export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  
  // Matikan worker fetch karena ini jalan di Node.js server
  // (Tidak perlu set workerSrc di node.js jika kita bypass webpack)

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => {
        if (item && typeof item === "object" && "str" in item) {
          return (item as { str: string }).str;
        }
        return "";
      })
      .join(" ");
    fullText += pageText + " ";
  }

  fullText = fullText.replace(/\s+/g, " ").trim();

  if (!fullText) {
    throw new Error("no_text");
  }

  return fullText.length > MAX_CHARS ? fullText.slice(0, MAX_CHARS) : fullText;
}
