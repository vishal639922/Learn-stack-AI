import { NextRequest } from "next/server";
import {
  apiError,
  apiResponse,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";
import {
  csvToHtml,
  detectDocumentType,
  docxToHtml,
  pdfToHtml,
} from "@/lib/document-import";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin", "subadmin", "editor", "author"]);
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return apiError("File not found", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("File size must be less than 10MB", 400);
    }

    const docType = detectDocumentType(file);
    if (!docType) {
      return apiError(
        "Unsupported file type. Upload .docx, .pdf, or .csv files only.",
        400
      );
    }

    if (
      file.name.toLowerCase().endsWith(".doc") &&
      !file.name.toLowerCase().endsWith(".docx")
    ) {
      return apiError(
        "Legacy .doc files are not supported. Please save as .docx and try again.",
        400
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let html = "";
    let warnings: string[] = [];

    switch (docType) {
      case "docx": {
        const result = await docxToHtml(buffer);
        html = result.html;
        warnings = result.warnings;
        break;
      }
      case "pdf":
        html = await pdfToHtml(buffer);
        break;
      case "csv":
        html = csvToHtml(buffer.toString("utf-8"));
        break;
    }

    if (!html.trim()) {
      return apiError("No content could be extracted from the file", 400);
    }

    return apiResponse({ html, warnings });
  } catch (err) {
    console.error("Document import failed:", err);
    return apiError("Conversion failed", 500);
  }
}
