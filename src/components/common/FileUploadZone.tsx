import React, { useRef, useState } from "react";
import {
  UploadCloud,
  X,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadDocumentAsset } from "@/lib/cloudUploader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FileUploadZoneProps {
  value?: string;
  onChange: (fileUrl: string) => void;
  onUpload?: (file: File) => Promise<string | void>;
  onUploadingChange?: (uploading: boolean) => void;
  showSuccessToast?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  className?: string;
  disabled?: boolean;
  error?: boolean | string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  value,
  onChange,
  onUpload,
  onUploadingChange,
  showSuccessToast = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
  maxSizeMB = 25,
  label = "Upload File or Document",
  helperText = "Drag & drop your file here, or click to browse",
  className,
  disabled = false,
  error,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const processUpload = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploading(true);
      onUploadingChange?.(true);
      setFileName(file.name);

      let uploadedUrl: string | void;
      if (onUpload) {
        uploadedUrl = await onUpload(file);
      } else {
        const res = await uploadDocumentAsset(file);
        uploadedUrl = res?.url;
      }

      if (uploadedUrl && typeof uploadedUrl === "string") {
        onChange(uploadedUrl);
        if (showSuccessToast) {
          toast.success(`"${file.name}" uploaded successfully!`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const getCleanDisplayName = (url: string) => {
    if (fileName) return fileName;
    try {
      const parts = url.split("/");
      const lastPart = parts[parts.length - 1];
      return decodeURIComponent(lastPart.split("?")[0]) || "Uploaded Document";
    } catch {
      return "Uploaded Document";
    }
  };

  const isPdf = (url: string, name: string) => {
    return url.toLowerCase().includes(".pdf") || name.toLowerCase().endsWith(".pdf");
  };

  const isSheet = (url: string, name: string) => {
    return (
      url.toLowerCase().includes(".xls") ||
      url.toLowerCase().includes(".csv") ||
      name.toLowerCase().endsWith(".xls") ||
      name.toLowerCase().endsWith(".xlsx") ||
      name.toLowerCase().endsWith(".csv")
    );
  };

  if (value) {
    const displayName = getCleanDisplayName(value);
    const pdf = isPdf(value, displayName);
    const sheet = isSheet(value, displayName);

    return (
      <div
        className={cn(
          "flex items-center justify-between p-3.5 bg-slate-50/80 border border-slate-200/90 rounded-2xl shadow-2xs transition-all",
          className
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden mr-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
              pdf
                ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                : sheet
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                : "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
            )}
          >
            {sheet ? <FileSpreadsheet className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[280px]">
                {displayName}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <span className="text-[11px] text-slate-400 block truncate">
              Ready for submission
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => {
              onChange("");
              setFileName("");
            }}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && !uploading && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed transition-all duration-200 text-center select-none",
        isDragging
          ? "border-indigo-500 bg-indigo-50/60 scale-[0.99]"
          : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-300",
        Boolean(error) && "border-red-400 bg-red-50/20 hover:border-red-400",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        uploading && "opacity-80 pointer-events-none bg-slate-50",
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-xs">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="text-xs font-semibold text-slate-800">
            Uploading {fileName || "file"}...
          </div>
          <p className="text-[11px] text-slate-400">Please wait while the file is processed</p>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800">
              {label}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {helperText}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            Max {maxSizeMB}MB • PDF, DOCX, XLSX
          </span>
        </>
      )}
    </div>
  );
};

export default FileUploadZone;
