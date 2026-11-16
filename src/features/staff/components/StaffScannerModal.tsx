import { useCallback, useState } from "react";
import { ScanLine } from "lucide-react";
import { toast } from "sonner";
import { FormField, ModalWrapper, QrScanner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useScanStaffPassMutation } from "../api";

export function StaffScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [passCode, setPassCode] = useState("");
  const [gate, setGate] = useState("");
  const [scan, scanState] = useScanStaffPassMutation();

  const submit = useCallback(async (value: string) => {
    if (!value.trim() || scanState.isLoading) return;
    try {
      const response = await scan({ pass_code: value.trim(), gate: gate.trim() || undefined }).unwrap();
      toast.success(`${response.attendance.staff_name} ${response.action === "checked_in" ? "checked in" : "checked out"}`);
      onClose();
    } catch (error: any) {
      toast.error(error?.data || "Staff pass was not found for this association");
    }
  }, [gate, onClose, scan, scanState.isLoading]);

  return <ModalWrapper isOpen={isOpen} onClose={onClose} title="Scan Staff QR" description="A valid staff QR toggles daily check-in and check-out." icon={<ScanLine size={18} />} size="lg">
    <div className="space-y-4">
      <QrScanner active={isOpen && !scanState.isLoading} onDetected={submit} />
      <FormField label="Pass Code or QR Link" helperText="Use this when camera scanning is unavailable."><Input value={passCode} onChange={(event) => setPassCode(event.target.value)} placeholder="Scan or enter the permanent pass code" /></FormField>
      <FormField label="Gate (optional)"><Input value={gate} onChange={(event) => setGate(event.target.value)} placeholder="Main Gate" /></FormField>
      <Button type="button" className="w-full" disabled={!passCode.trim()} isLoading={scanState.isLoading} onClick={() => submit(passCode)}>Record Attendance</Button>
    </div>
  </ModalWrapper>;
}
