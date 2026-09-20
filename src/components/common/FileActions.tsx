import React from "react";
import { Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FileActionsProps {
  /** URL of the document to open or download. */
  fileUrl?: string | null;
  /** Optional separate URL for downloads, useful when the open URL is a page. */
  downloadUrl?: string | null;
  /** Shows the redirect button when a file URL is available. */
  canOpen?: boolean;
  /** Shows the download button when a file URL is available. */
  canDownload?: boolean;
  /** Compact table-action sizing. */
  size?: "xs" | "sm" | "md";
  /** Optional container classes. */
  className?: string;
  /** Optional filename used by the download action. */
  downloadName?: string;
  /** Optional custom download action when the target is not a normal file. */
  onDownload?: () => void | Promise<void>;
}

export const FileActions: React.FC<FileActionsProps> = ({
  fileUrl,
  downloadUrl,
  canOpen = true,
  canDownload = true,
  size = "sm",
  className,
  downloadName,
  onDownload,
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 rounded-md",
    sm: "h-7 w-7 rounded-lg",
    md: "h-8 w-8 rounded-lg",
  }[size];

  const iconSizes = {
    xs: 12,
    sm: 13,
    md: 14,
  }[size];

  const canShowOpen = Boolean(fileUrl) && canOpen;
  const resolvedDownloadUrl = downloadUrl || fileUrl;
  const canShowDownload = Boolean(resolvedDownloadUrl) && canDownload;

  const downloadFile = async () => {
    if (!resolvedDownloadUrl) return;

    try {
      if (onDownload) {
        await onDownload();
        return;
      }

      // External storage URLs (for example UploadThing/S3) reject credentialed
      // CORS requests. Keep cookies for same-origin protected files, but never
      // send them to a different origin.
      const response = await fetch(resolvedDownloadUrl, {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`);

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = downloadName || resolvedDownloadUrl.split("/").pop()?.split("?")[0] || "download";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Unable to download file");
    }
  };

  if (!canShowOpen && !canShowDownload) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {canShowOpen ? (
        <a
          href={fileUrl || undefined}
          target="_blank"
          rel="noreferrer"
          title="Open file"
          aria-label="Open file"
          className={cn(
            "inline-flex items-center justify-center text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition-colors",
            sizeClasses,
          )}
        >
          <ExternalLink size={iconSizes} />
        </a>
      ) : null}

      {canShowDownload ? (
        <button
          type="button"
          onClick={downloadFile}
          title="Download file"
          aria-label="Download file"
          className={cn(
            "inline-flex items-center justify-center text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors",
            sizeClasses,
          )}
        >
          <Download size={iconSizes} />
        </button>
      ) : null}
    </div>
  );
};

export default FileActions;
