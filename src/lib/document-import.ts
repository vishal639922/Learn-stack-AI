import mammoth from "mammoth";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

export function csvToHtml(text: string): string {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return "<p></p>";

  const rows = lines.map(parseCsvLine);
  const [header, ...body] = rows;

  const renderRow = (cells: string[], tag: "th" | "td") =>
    `<tr>${cells.map((cell) => `<${tag}>${escapeHtml(cell)}</${tag}>`).join("")}</tr>`;

  return `<table><thead>${renderRow(header, "th")}</thead><tbody>${body.map((row) => renderRow(row, "td")).join("")}</tbody></table>`;
}

export async function pdfToHtml(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });

  let text = "";
  try {
    const result = await parser.getText();
    text = result.text;
  } finally {
    await parser.destroy();
  }

  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return "<p></p>";
  }

  return blocks
    .map((block) => {
      const lines = block.split(/\n/);
      const isHeading =
        lines.length === 1 &&
        lines[0].length < 80 &&
        (/^[A-Z0-9][A-Z0-9\s\-:]{2,}$/.test(lines[0]) ||
          /^\d+(\.\d+)*\s+[A-Z]/.test(lines[0]));

      if (isHeading) {
        return `<h2>${escapeHtml(lines[0])}</h2>`;
      }

      return `<p>${lines.map(escapeHtml).join("<br>")}</p>`;
    })
    .join("");
}

export async function docxToHtml(buffer: Buffer): Promise<{
  html: string;
  warnings: string[];
}> {
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Title'] => h1:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  );

  return {
    html: result.value,
    warnings: result.messages.map((m) => m.message),
  };
}

export type DocumentType = "docx" | "pdf" | "csv";

export function detectDocumentType(file: File): DocumentType | null {
  const name = file.name.toLowerCase();

  if (
    name.endsWith(".docx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    return "pdf";
  }

  if (name.endsWith(".csv") || file.type === "text/csv") {
    return "csv";
  }

  return null;
}
