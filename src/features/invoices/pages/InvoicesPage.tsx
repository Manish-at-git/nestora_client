import React, { useMemo, useState } from "react";
import { FileText, Pencil, Plus, Search } from "lucide-react";

import { useAppSelector } from "@/app/hooks";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useGetInvoicesQuery } from "../api";
import { InvoiceEditorModal } from "../components";
import type { Invoice, InvoiceStatus } from "../types";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export const InvoicesPage: React.FC = () => {
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const { canView, canCreate, canUpdate, isLoading: permissionsLoading } = usePermission(FEATURES.INVOICE.FEATURE_CODE);
  const [category, setCategory] = useState(""); const [status, setStatus] = useState<InvoiceStatus | "">(""); const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false); const [editing, setEditing] = useState<Invoice | null>(null);
  const skip = !canView || !associationId || associationId === "ALL";
  const { data, isLoading, isError } = useGetInvoicesQuery({ associationId: String(associationId || ""), category: category || undefined, status: status || undefined, search: search.trim() || undefined }, { skip });
  usePageHeader({ title: "Invoice", description: "Create and manage vendor invoices for the selected association." });
  const metrics = useMemo(() => data ? [["Total invoices", String(data.total_count)], ["Total amount", money.format(Number(data.total_amount))], ["Paid", money.format(Number(data.paid_amount))], ["Pending / overdue", money.format(Number(data.pending_amount) + Number(data.overdue_amount))]] : [], [data]);
  if (permissionsLoading || isLoading) return <LoadingSpinner />;
  if (!canView) return <AccessRestricted moduleName="Invoice" showAction />;
  if (!associationId || associationId === "ALL") return <EmptyState icon={FileText} title="Select an association" description="Choose an association to view invoices." className="min-h-[420px]" />;
  if (isError) return <EmptyState icon={FileText} title="Unable to load invoices" description="Please try again." className="min-h-[420px]" />;
  if (!data?.rows.length && !category && !status && !search.trim()) {
    return <>
      <div className="space-y-5">
        <div className="flex flex-wrap justify-end gap-2">
          <Select value={category} onValueChange={setCategory} options={[{ value: "", label: "All categories" }]} placeholder="All categories" size="sm" containerClassName="w-auto" className="min-w-44" />
          <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus | "")} options={[{ value: "", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} placeholder="All statuses" size="sm" containerClassName="w-auto" className="min-w-36" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendor or invoice" leftIcon={<Search className="h-4 w-4" />} size="sm" containerClassName="w-64" />
          {canCreate && <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-4 w-4" /> Create Invoice</Button>}
        </div>
        <div className="relative">
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create the first vendor invoice for this association to start tracking payable amounts."
            className="min-h-[420px]"
          />
        </div>
      </div>
      <InvoiceEditorModal isOpen={editorOpen} associationId={String(associationId)} invoice={editing} onClose={() => { setEditorOpen(false); setEditing(null); }} />
    </>;
  }
  return <><div className="space-y-5"><div className="flex flex-wrap justify-end gap-2"><Select value={category} onValueChange={setCategory} options={[{ value: "", label: "All categories" }, ...(data?.available_categories || []).map((item) => ({ value: item, label: item }))]} placeholder="All categories" size="sm" containerClassName="w-auto" className="min-w-44" /><Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus | "")} options={[{ value: "", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} placeholder="All statuses" size="sm" containerClassName="w-auto" className="min-w-36" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendor or invoice" leftIcon={<Search className="h-4 w-4" />} size="sm" containerClassName="w-64" />{canCreate && <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-4 w-4" /> Create Invoice</Button>}</div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}</div><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">Invoices</h2></div><table className="w-full table-fixed text-xs"><thead className="bg-slate-50 text-left uppercase tracking-wide text-slate-500"><tr><th className="w-10 px-3 py-3">#</th><th className="px-3 py-3">Vendor</th><th className="px-3 py-3">Invoice</th><th className="px-3 py-3">Due date</th><th className="px-3 py-3 text-right">Total</th><th className="px-3 py-3">Status</th><th className="w-14 px-3 py-3" /></tr></thead><tbody className="divide-y divide-slate-100">{data?.rows.map((invoice, index) => <tr key={invoice.id}><td className="px-3 py-2 text-slate-400">{index + 1}</td><td className="truncate px-3 py-2 font-semibold">{invoice.vendor_name}<p className="truncate text-[10px] font-normal text-slate-400">{invoice.category}</p></td><td className="px-3 py-2">{invoice.invoice_number}</td><td className="px-3 py-2">{new Date(`${invoice.due_date}T00:00:00`).toLocaleDateString("en-IN")}</td><td className="px-3 py-2 text-right font-mono font-semibold">{money.format(Number(invoice.total_amount))}</td><td className="px-3 py-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${invoice.status === "paid" ? "bg-emerald-50 text-emerald-700" : invoice.status === "overdue" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{invoice.status}</span></td><td className="px-3 py-2">{canUpdate && <Button variant="ghost" size="iconSm" aria-label="Edit invoice" onClick={() => { setEditing(invoice); setEditorOpen(true); }}><Pencil className="h-4 w-4 text-slate-500" /></Button>}</td></tr>)}</tbody></table>{!data?.rows.length && <div className="p-10 text-center text-sm text-slate-500">No invoices match the selected filters.</div>}</section></div><InvoiceEditorModal isOpen={editorOpen} associationId={String(associationId)} invoice={editing} onClose={() => { setEditorOpen(false); setEditing(null); }} /></>;
};
