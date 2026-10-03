import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function PassQRCode({ url }: { url: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, { width: 260, margin: 2 }).then((dataUrl) => {
      if (active) setImage(dataUrl);
    });
    return () => { active = false; };
  }, [url]);

  if (!image) return <div className="mx-auto h-52 w-52 bg-slate-100 animate-pulse" />;
  return <img src={image} alt="Event pass QR code" className="mx-auto h-52 w-52 rounded-lg bg-white p-2" />;
}
