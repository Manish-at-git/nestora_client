import html2canvas from "html2canvas";

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN = 18;

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

const createSinglePagePdf = (jpeg: Uint8Array, imageWidth: number, imageHeight: number) => {
  const availableWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const availableHeight = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;
  const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const x = (PDF_PAGE_WIDTH - width) / 2;
  const y = PDF_PAGE_HEIGHT - height - PDF_MARGIN;
  const pageContent = `q\n${width} 0 0 ${height} ${x} ${y} cm\n/Im0 Do\nQ\n`;
  const objects = [
    ascii("<< /Type /Catalog /Pages 2 0 R >>"),
    ascii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
    ascii("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>"),
    ascii(`<< /Length ${new TextEncoder().encode(pageContent).length} >>\nstream\n${pageContent}endstream`),
    concatBytes(
      ascii(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`),
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
  chunks.push(
    ascii(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
        .slice(1)
        .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
        .join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );
  return concatBytes(...chunks);
};

export const downloadInvoicePdf = async (element: HTMLElement, invoiceNumber: string) => {
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
  });
  const jpegData = canvas.toDataURL("image/jpeg", 0.95).split(",")[1];
  const pdf = createSinglePagePdf(base64ToBytes(jpegData), canvas.width, canvas.height);
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
