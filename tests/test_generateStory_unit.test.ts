/**
 * Test: lib/generateStory.ts - prompt builder (unit test tanpa API call)
 *
 * Pengujian logika internal prompt dan client builder
 * menggunakan mock untuk menghindari API call nyata.
 */

// Mock openai sebelum import
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

import OpenAI from "openai";
import { generateStory } from "../lib/generateStory";

const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

function getMockCreate(mockInstance: OpenAI) {
  return mockInstance.chat.completions.create as jest.MockedFunction<
    typeof mockInstance.chat.completions.create
  >;
}

describe("generateStory - unit test dengan mock API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = "sk-test-mock-key";
  });

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "sk-test-mock-key";
  });

  it("harus memanggil OpenAI.chat.completions.create satu kali", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "Perjalanan Tetes Air",
              story: "Di suatu hari yang cerah, setetes air di laut bernama Teti merasa hangat.",
            }),
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    const result = await generateStory(
      "Teks PDF tentang siklus air",
      "",
      "short",
      "test.pdf"
    );

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(result.title).toBe("Perjalanan Tetes Air");
    expect(result.story).toContain("Teti");
  });

  it("harus memanggil model google/gemini-2.5-flash", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "Judul", "story": "Isi cerita"}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await generateStory("teks pdf", "", "short", "test.pdf");

    const callArgs = mockCreate.mock.calls[0][0] as { model: string };
    expect(callArgs.model).toBe("deepseek/deepseek-v4-flash");
  });

  it("harus melempar error jika respons tidak mengandung JSON", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: "Maaf, saya tidak bisa membuat cerita ini.",
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await expect(
      generateStory("teks pdf", "", "short", "test.pdf")
    ).rejects.toThrow("JSON");
  });

  it("harus melempar error jika title kosong dalam JSON", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "", "story": "isi cerita"}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await expect(
      generateStory("teks pdf", "", "short", "test.pdf")
    ).rejects.toThrow();
  });

  it("harus melempar error jika story kosong dalam JSON", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "Judul Bagus", "story": ""}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await expect(
      generateStory("teks pdf", "", "short", "test.pdf")
    ).rejects.toThrow();
  });

  it("harus mengirim focus dalam prompt ketika diberikan", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "Evaporasi", "story": "Kisah tentang evaporasi air"}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await generateStory("teks pdf siklus air", "proses evaporasi", "short", "test.pdf");

    const callArgs = mockCreate.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>;
    };
    const userMessage = callArgs.messages.find((m) => m.role === "user")?.content ?? "";

    expect(userMessage).toContain("proses evaporasi");
  });

  it("harus meneruskan length 'medium' ke prompt", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "Judul", "story": "Cerita panjang"}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    await generateStory("teks pdf", "", "medium", "test.pdf");

    const callArgs = mockCreate.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>;
    };
    const userMessage = callArgs.messages.find((m) => m.role === "user")?.content ?? "";

    expect(userMessage).toContain("medium");
  });

  it("harus mengembalikan sourceFile yang sesuai nama file", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: '{"title": "Judul", "story": "Isi"}',
          },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    const result = await generateStory("teks", "", "short", "materi-biologi.pdf");
    expect(result.sourceFile).toBe("materi-biologi.pdf");
  });

  it("harus bisa mem-parse JSON yang embedded dalam markdown code block", async () => {
    const mockInstance = new MockedOpenAI();
    const mockCreate = getMockCreate(mockInstance);

    // Gemini kadang membungkus JSON dalam markdown
    const markdownJson = `Berikut ceritanya:\n\`\`\`json\n{"title": "Judul", "story": "Isi cerita panjang"}\n\`\`\``;

    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: { content: markdownJson },
        },
      ],
    } as Awaited<ReturnType<typeof mockCreate>>);

    MockedOpenAI.mockImplementation(() => mockInstance);

    const result = await generateStory("teks", "", "short", "test.pdf");
    expect(result.title).toBe("Judul");
    expect(result.story).toBe("Isi cerita panjang");
  });

  it("harus melempar error jika OPENROUTER_API_KEY tidak ada", async () => {
    delete process.env.OPENROUTER_API_KEY;

    await expect(
      generateStory("teks pdf", "", "short", "test.pdf")
    ).rejects.toThrow("OPENROUTER_API_KEY");
  });
});
