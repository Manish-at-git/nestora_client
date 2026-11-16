import { useEffect, useRef, useState } from "react";

type BarcodeReader = { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type BarcodeReaderConstructor = new (options: { formats: string[] }) => BarcodeReader;

interface QrScannerProps {
  active: boolean;
  onDetected: (value: string) => void;
}

/** Browser-native QR camera reader with a graceful fallback for manual entry. */
export function QrScanner({ active, onDetected }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let cancelled = false;

    const start = async () => {
      const Detector = (window as Window & { BarcodeDetector?: BarcodeReaderConstructor }).BarcodeDetector;
      if (!Detector) {
        setError("Camera scanning is unavailable in this browser. Enter the pass code manually.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ["qr_code"] });
        timer = window.setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes[0]?.rawValue) onDetected(codes[0].rawValue);
          } catch {
            // A later frame may be readable.
          }
        }, 500);
      } catch {
        setError("Camera unavailable. Allow camera access or enter the pass code manually.");
      }
    };

    start();
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [active, onDetected]);

  return (
    <div className="space-y-2">
      <video ref={videoRef} muted playsInline className="max-h-64 w-full rounded-xl bg-slate-900" />
      {error ? <p className="text-sm text-slate-500">{error}</p> : null}
    </div>
  );
}
