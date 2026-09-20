import apiClient from "@/services/api/apiClient";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL 

/**
 * Resolves an image or file URL safely.
 * Returns the URL as-is if it's already an absolute URL (e.g. UploadThing CDN / Cloudinary),
 * otherwise prepends backend URL for legacy relative paths.
 */
export function resolveMediaUrl(url?: string | null, fallback: string = ""): string {
  if (!url || typeof url !== "string") return fallback;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("//")
  ) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BACKEND_URL}${cleanUrl}`;
}

/**
 * Uploads an image or video file to Cloud Storage.
 */
export async function uploadMediaAsset(
  file: File
): Promise<{ ok: boolean; url: string; asset_type: string; provider: string }> {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload-media-asset", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data?.data || response.data;
}

/**
 * Uploads a document or generic file (PDF, Excel, Word, etc.) to Cloud Storage.
 */
export async function uploadDocumentAsset(
  file: File
): Promise<{ ok: boolean; url: string; asset_type: string; provider: string }> {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/upload-document-asset", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data?.data || response.data;
}
