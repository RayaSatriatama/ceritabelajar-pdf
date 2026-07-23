export type StoryLength = "short" | "medium";

export type AppState =
  | "empty"
  | "file_selected"
  | "loading"
  | "success"
  | "upload_error"
  | "processing_error";

export interface StoryRequest {
  pdfText: string;
  focus: string;
  length: StoryLength;
  fileName: string;
}

export interface StoryResponse {
  title: string;
  story: string;
  sourceFile: string;
  length: StoryLength;
}

export interface FileInfo {
  name: string;
  size: number;
  file: File;
}
