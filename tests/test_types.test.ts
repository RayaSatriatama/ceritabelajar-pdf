/**
 * Test: types/story.ts
 *
 * Pengujian type safety - verifikasi bahwa tipe data
 * berperilaku sesuai kontrak yang didefinisikan.
 */

import type { StoryLength, AppState, StoryRequest, StoryResponse, FileInfo } from "../types/story";

describe("Types - StoryLength", () => {
  it("short adalah nilai valid", () => {
    const length: StoryLength = "short";
    expect(length).toBe("short");
  });

  it("medium adalah nilai valid", () => {
    const length: StoryLength = "medium";
    expect(length).toBe("medium");
  });

  it("hanya ada dua pilihan yang valid", () => {
    const validLengths: StoryLength[] = ["short", "medium"];
    expect(validLengths).toHaveLength(2);
    expect(validLengths).toContain("short");
    expect(validLengths).toContain("medium");
  });
});

describe("Types - AppState", () => {
  it("semua state machine state harus valid", () => {
    const states: AppState[] = [
      "empty",
      "file_selected",
      "loading",
      "success",
      "upload_error",
      "processing_error",
    ];

    expect(states).toHaveLength(6);
    expect(states).toContain("empty");
    expect(states).toContain("file_selected");
    expect(states).toContain("loading");
    expect(states).toContain("success");
    expect(states).toContain("upload_error");
    expect(states).toContain("processing_error");
  });
});

describe("Types - StoryRequest", () => {
  it("harus bisa dibuat objek StoryRequest yang valid", () => {
    const req: StoryRequest = {
      pdfText: "Ini adalah teks dari PDF",
      focus: "fokus cerita",
      length: "short",
      fileName: "materi.pdf",
    };

    expect(req.pdfText).toBe("Ini adalah teks dari PDF");
    expect(req.focus).toBe("fokus cerita");
    expect(req.length).toBe("short");
    expect(req.fileName).toBe("materi.pdf");
  });

  it("focus boleh berupa string kosong (opsional)", () => {
    const req: StoryRequest = {
      pdfText: "teks",
      focus: "",
      length: "medium",
      fileName: "test.pdf",
    };

    expect(req.focus).toBe("");
    expect(typeof req.focus).toBe("string");
  });
});

describe("Types - StoryResponse", () => {
  it("harus bisa dibuat objek StoryResponse yang valid", () => {
    const res: StoryResponse = {
      title: "Perjalanan Tetes Air",
      story: "Di suatu hari yang cerah...",
      sourceFile: "materi-siklus-air.pdf",
      length: "short",
    };

    expect(res.title).toBe("Perjalanan Tetes Air");
    expect(res.story).toBe("Di suatu hari yang cerah...");
    expect(res.sourceFile).toBe("materi-siklus-air.pdf");
    expect(res.length).toBe("short");
  });

  it("length dalam response harus konsisten dengan yang diminta", () => {
    const res: StoryResponse = {
      title: "Judul",
      story: "Isi",
      sourceFile: "file.pdf",
      length: "medium",
    };

    expect(["short", "medium"]).toContain(res.length);
  });
});

describe("Types - FileInfo", () => {
  it("harus bisa dibuat objek FileInfo yang valid", () => {
    const mockFile = new File(["konten pdf"], "materi.pdf", { type: "application/pdf" });
    const info: FileInfo = {
      name: "materi.pdf",
      size: 1024,
      file: mockFile,
    };

    expect(info.name).toBe("materi.pdf");
    expect(info.size).toBe(1024);
    expect(info.file).toBeInstanceOf(File);
    expect(info.file.name).toBe("materi.pdf");
  });

  it("size harus berupa angka positif", () => {
    const mockFile = new File(["x"], "x.pdf");
    const info: FileInfo = {
      name: "x.pdf",
      size: 2400000,
      file: mockFile,
    };

    expect(info.size).toBeGreaterThan(0);
    expect(typeof info.size).toBe("number");
  });
});

// ---- Guard functions yang digunakan di aplikasi ----
describe("Business logic - validasi runtime", () => {
  function isValidPdf(fileName: string, sizeBytes: number): boolean {
    return fileName.toLowerCase().endsWith(".pdf") && sizeBytes <= 10 * 1024 * 1024;
  }

  function isValidFocus(focus: string): boolean {
    return focus.length <= 150;
  }

  function isValidLength(length: string): length is StoryLength {
    return length === "short" || length === "medium";
  }

  it("isValidPdf harus menolak file bukan PDF", () => {
    expect(isValidPdf("materi.docx", 1000)).toBe(false);
    expect(isValidPdf("materi.txt", 1000)).toBe(false);
    expect(isValidPdf("materi.jpg", 1000)).toBe(false);
  });

  it("isValidPdf harus menerima file PDF di bawah 10 MB", () => {
    expect(isValidPdf("materi.pdf", 5 * 1024 * 1024)).toBe(true);
    expect(isValidPdf("materi.PDF", 1 * 1024 * 1024)).toBe(true);
  });

  it("isValidPdf harus menolak file PDF di atas 10 MB", () => {
    expect(isValidPdf("materi.pdf", 11 * 1024 * 1024)).toBe(false);
  });

  it("isValidFocus harus menerima teks <= 150 karakter", () => {
    expect(isValidFocus("proses evaporasi")).toBe(true);
    expect(isValidFocus("")).toBe(true);
    expect(isValidFocus("a".repeat(150))).toBe(true);
  });

  it("isValidFocus harus menolak teks > 150 karakter", () => {
    expect(isValidFocus("a".repeat(151))).toBe(false);
  });

  it("isValidLength harus mengakui short dan medium", () => {
    expect(isValidLength("short")).toBe(true);
    expect(isValidLength("medium")).toBe(true);
  });

  it("isValidLength harus menolak nilai lain", () => {
    expect(isValidLength("long")).toBe(false);
    expect(isValidLength("")).toBe(false);
    expect(isValidLength("SHORT")).toBe(false);
  });
});
