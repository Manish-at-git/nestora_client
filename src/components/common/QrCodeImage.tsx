import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QrCodeImageProps {
  value: string;
  alt: string;
  className?: string;
}

/** Render QR data locally so passes do not depend on a third-party QR image service. */
export function QrCodeImage({ value, alt, className }: QrCodeImageProps) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(value, { width: 360, margin: 1 }).then((dataUrl) => {
      if (mounted) setImage(dataUrl);
    });
    return () => { mounted = false; };
  }, [value]);

  if (!image) return <div className={`animate-pulse bg-slate-100 ${className || "h-40 w-40"}`} />;
  return <img src={image} alt={alt} className={className} />;
}
