import type { PreApprovedVisitor } from "../types";
import { formatVisitDate, formatVisitTime } from "./formatters";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load QR code"));
    image.src = src;
  });

const base64ToBytes = (value: string) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const ascii = (value: string) => new TextEncoder().encode(value);

const concatBytes = (...parts: Uint8Array[]) => {
  const result = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
};

const createJpegPdf = (jpeg: Uint8Array, width: number, height: number) => {
  const pageContent = "q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n";
  const objects = [
    ascii("<< /Type /Catalog /Pages 2 0 R >>"),
    ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>"),
    ascii(`<< /Length ${new TextEncoder().encode(pageContent).length} >>\nstream\n${pageContent}endstream`),
    concatBytes(
      ascii(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
      jpeg,
      ascii("\nendstream"),
    ),
  ];

  const header = ascii("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");
  const chunks: Uint8Array[] = [header];
  const offsets = [0];
  let length = header.length;

  objects.forEach((object, index) => {
    offsets.push(length);
    const chunk = concatBytes(ascii(`${index + 1} 0 obj\n`), object, ascii("\nendobj\n"));
    chunks.push(chunk);
    length += chunk.length;
  });

  const xrefOffset = length;
  const xref = ascii(
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
      .join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );
  chunks.push(xref);
  return concatBytes(...chunks);
};

export const downloadVisitorPassPdf = async (
  visitor: PreApprovedVisitor,
  qrUrl: string,
) => {
  const qrImage = await loadImage(qrUrl);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 1273;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create PDF canvas");

  context.fillStyle = "#f8fafc";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#4f46e5";
  context.fillRect(0, 0, canvas.width, 250);
  context.fillStyle = "#ffffff";
  context.font = "700 42px Arial";
  context.fillText("Nestora Visitor Pass", 70, 105);
  context.font = "500 24px Arial";
  context.fillText(visitor.status, 70, 150);

  context.fillStyle = "#ffffff";
  context.shadowColor = "rgba(15, 23, 42, 0.18)";
  context.shadowBlur = 24;
  context.fillRect(100, 190, 700, 430);
  context.shadowBlur = 0;
  context.drawImage(qrImage, 290, 220, 320, 320);
  context.fillStyle = "#64748b";
  context.font = "700 20px Arial";
  context.fillText("PASS CODE", 360, 580);
  context.fillStyle = "#1e293b";
  context.font = "700 30px monospace";
  context.fillText(visitor.pass_code, 330, 610);

  context.fillStyle = "#64748b";
  context.font = "700 20px Arial";
  context.fillText("VISITOR", 100, 715);
  context.fillStyle = "#1e293b";
  context.font = "700 32px Arial";
  context.fillText(visitor.visitor_name, 100, 760);
  context.fillStyle = "#64748b";
  context.font = "24px Arial";
  context.fillText(`${visitor.mobile} • ${visitor.visitor_type}`, 100, 800);

  context.fillStyle = "#ffffff";
  context.fillRect(100, 860, 330, 130);
  context.fillRect(470, 860, 330, 130);
  context.fillStyle = "#64748b";
  context.font = "700 20px Arial";
  context.fillText("DATE", 125, 900);
  context.fillText("TIME", 495, 900);
  context.fillStyle = "#1e293b";
  context.font = "700 23px Arial";
  context.fillText(formatVisitDate(visitor.visit_date), 125, 945);
  context.font = "700 19px Arial";
  context.fillText(`${formatVisitTime(visitor.start_time)} - ${formatVisitTime(visitor.end_time)}`, 495, 945);

  if (visitor.otp) {
    context.fillStyle = "#fffbeb";
    context.fillRect(100, 1030, 700, 140);
    context.fillStyle = "#b45309";
    context.font = "700 20px Arial";
    context.fillText("SECURITY OTP", 125, 1070);
    context.font = "700 34px monospace";
    context.fillText(visitor.otp, 125, 1120);
  }

  const jpegData = canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
  const pdf = createJpegPdf(base64ToBytes(jpegData), canvas.width, canvas.height);
  const blobUrl = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `${visitor.pass_code}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
};
