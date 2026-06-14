"use client";

import { useState, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  editor: Editor | null;
  onImportSuccess?: () => void;
}

const ACCEPTED_EXTENSIONS = [".docx", ".pdf", ".csv"];
const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/csv",
];

export default function DocxImportButton({
  editor,
  onImportSuccess,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file) return false;

    const name = file.name.toLowerCase();
    const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
    const hasValidType = ACCEPTED_TYPES.includes(file.type);

    if (!hasValidExtension && !hasValidType) {
      setError("Please upload a .docx, .pdf, or .csv file");
      return false;
    }

    if (name.endsWith(".doc") && !name.endsWith(".docx")) {
      setError("Legacy .doc files are not supported. Save as .docx first.");
      return false;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return false;
    }

    setError(null);
    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file) || !editor) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/articles/import-docx", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Conversion failed");
      }

      const html = result.data?.html;
      if (!html) {
        throw new Error("No content returned from conversion");
      }

      editor.commands.setContent(html, { emitUpdate: true });
      onImportSuccess?.();

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.csv"
        hidden
        onChange={handleFileInput}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`gap-2 ${isDragging ? "border-primary bg-primary/10" : ""}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Converting... {uploadProgress}%
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Import DOC/PDF/CSV
          </>
        )}
      </Button>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive max-w-xs z-50">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Upload Error</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="flex-shrink-0 hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
