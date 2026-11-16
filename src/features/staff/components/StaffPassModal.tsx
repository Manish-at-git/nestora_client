import { Copy, IdCard, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ModalWrapper, QrCodeImage } from "@/components/common";
import type { StaffMember } from "../types";

export function StaffPassModal({ staff, onClose }: { staff: StaffMember | null; onClose: () => void }) {
  if (!staff) return null;
  const passUrl = `${window.location.origin}/staff?pass=${encodeURIComponent(staff.pass_code)}`;
  const copy = async () => {
    await navigator.clipboard.writeText(staff.pass_code);
    toast.success("Staff pass code copied");
  };

  return (
    <ModalWrapper isOpen={Boolean(staff)} onClose={onClose} size="md" hideClose bodyClassName="overflow-hidden p-0" className="max-w-sm overflow-hidden rounded-[2rem] border-0">
      <div className="relative bg-white">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/20" aria-label="Close staff pass"><X size={20} /></button>
        <div className="rounded-b-[2.5rem] bg-slate-800 px-6 pb-10 pt-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20"><IdCard size={30} /></div>
          <h3 className="text-2xl font-bold">Staff Pass</h3>
          <p className="mt-1 text-sm text-white/75">Permanent attendance QR</p>
        </div>
        <div className="-mt-8 space-y-4 px-6 pb-6">
          <div className="rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-xl">
            <QrCodeImage value={passUrl} alt={`QR code for ${staff.first_name} ${staff.last_name}`} className="mx-auto h-44 w-44 rounded-xl bg-white p-2" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">Pass Code</p>
            <p className="font-mono text-lg font-bold tracking-widest text-slate-800">{staff.pass_code}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Staff Member</p>
            <p className="font-semibold text-slate-900">{staff.first_name} {staff.last_name}</p>
            <p className="text-sm text-slate-500">{staff.designation} · {staff.association_name}</p>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={copy}><Copy size={16} /> Copy Pass Code</Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
