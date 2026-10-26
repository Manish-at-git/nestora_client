import React, { useMemo, useState } from "react";
import { CheckCircle2, CircleCheckBig, Clock3, Download, Eye, FileText, IndianRupee, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { AccessRestricted, ConfirmDialog, DataTable, EmptyState, LoadingSpinner, MonthPicker } from "@/components/common";
import type { Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { isFinancialViewOnlyRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import { useDeleteInvoiceMutation, useGetInvoicesQuery, useGetInvoiceVendorsQuery, useUpdateInvoiceStatusMutation } from "../api";
import { InvoiceEditorModal, InvoicePreviewModal } from "../components";
import type { Invoice, InvoiceStatus } from "../types";

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export const InvoicesPage: React.FC = () => {
  const { account } = useAuth();
  const isFinancialViewOnly = isFinancialViewOnlyRole(account?.role_code);
  const associationId = useAppSelector((state) => state.ui.activeAssociationId);
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    canView,
    canCreate: canCreatePermission,
    canUpdate: canUpdatePermission,
    canDelete: canDeletePermission,
    isLoading: permissionsLoading,
  } = usePermission(FEATURES.INVOICE.FEATURE_CODE);
  const canCreate = canCreatePermission && !isFinancialViewOnly;
  const canUpdate = canUpdatePermission && !isFinancialViewOnly;
  const canDelete = canDeletePermission && !isFinancialViewOnly;
  const canExport = !isFinancialViewOnly;
  const [vendorId, setVendorId] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [fiscalPeriod, setFiscalPeriod] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [previewing, setPreviewing] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState<Invoice | null>(null);
  const [markingPaid, setMarkingPaid] = useState<Invoice | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const skip = !canView || !associationId || associationId === "ALL";
  const association = String(associationId || "");
  const { data, isLoading, isFetching, isError } = useGetInvoicesQuery({ associationId: association, vendorId: vendorId || undefined, status: status || undefined, fiscalPeriod: fiscalPeriod || undefined, search: search.trim() || undefined, page, pageSize }, { skip });
  const { data: vendors = [] } = useGetInvoiceVendorsQuery(association, { skip });
  const [deleteInvoice, deleteState] = useDeleteInvoiceMutation();
  const [updateInvoiceStatus, updateStatusState] = useUpdateInvoiceStatusMutation();

  usePageHeader({ title: "Invoice", description: "Create and manage vendor invoices for the selected association." });

  const isCreateRouteOpen = Boolean(
    searchParams.get("create") === "1" && canCreate && associationId && associationId !== "ALL",
  );

  const clearCreateParameter = () => {
    if (searchParams.get("create") !== "1") return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("create");
    setSearchParams(nextParams, { replace: true });
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    clearCreateParameter();
  };

  const resetPage = <T,>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => { setter(value); setPage(1); };
  const exportInvoices = async () => {
    try {
      const response = await apiClient.get("/invoices/export", { params: { association_id: association, vendor_id: vendorId || undefined, status_filter: status || undefined, fiscal_period: fiscalPeriod || undefined, search: search.trim() || undefined }, responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices_${fiscalPeriod || "all"}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) { toast.error(formatApiErrorDetail(error)); }
  };

  const columns = useMemo<Column<Invoice>[]>(() => [
    { key: "invoice_number", header: "Invoice no.", render: (row) => <p className="font-semibold text-blue-600">{row.invoice_number}</p> },
    { key: "vendor_name", header: "Vendor", render: (row) => <p className="font-semibold text-slate-800">{row.vendor_name}</p> },
    { key: "description", header: "Description", render: (row) => <p className="max-w-52 truncate text-slate-600">{row.lines[0]?.description || "—"}</p> },
    { key: "issue_date", header: "Invoice date", render: (row) => new Date(`${row.issue_date}T00:00:00`).toLocaleDateString("en-IN") },
    { key: "due_date", header: "Due date", render: (row) => new Date(`${row.due_date}T00:00:00`).toLocaleDateString("en-IN") },
    { key: "grand_total", header: "Amount (₹)", className: "text-right font-mono font-semibold", headerClassName: "text-right", render: (row) => money.format(Number(row.grand_total)) },
    { key: "status", header: "Status", render: (row) => <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${row.status === "paid" ? "bg-emerald-50 text-emerald-700" : row.status === "overdue" ? "bg-rose-50 text-rose-700" : row.status === "cancelled" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{row.status}</span> },
    { key: "actions", header: "Actions", width: 160, sortable: false, render: (row) => <div className="flex justify-center gap-1"><Button variant="ghost" size="iconSm" aria-label="View invoice" onClick={() => setPreviewing(row)}><Eye className="h-4 w-4" /></Button>{canUpdate && <Button variant="ghost" size="iconSm" aria-label="Edit invoice" onClick={() => { setEditing(row); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button>}{canUpdate && (row.status === "pending" || row.status === "overdue") && <Button variant="ghost" size="iconSm" aria-label="Mark invoice as paid" onClick={() => setMarkingPaid(row)}><CircleCheckBig className="h-4 w-4 text-emerald-600" /></Button>}{canDelete && <Button variant="ghost" size="iconSm" aria-label="Delete invoice" onClick={() => setDeleting(row)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>}</div> },
  ], [canDelete, canUpdate]);

  if (permissionsLoading || (isLoading && !data)) return <LoadingSpinner />;
  if (!canView) return <AccessRestricted moduleName="Invoice" showAction />;
  if (!associationId || associationId === "ALL") return <EmptyState icon={FileText} title="Select an association" description="Choose one association to view its invoices. All Associations is not used for financial records." className="min-h-[420px]" />;
  if (isError) return <EmptyState icon={FileText} title="Unable to load invoices" description="Please try again." className="min-h-[420px]" />;

  const filters = <div className="flex flex-wrap gap-2"><Select value={vendorId} onValueChange={(value) => resetPage(setVendorId, value)} options={[{ value: "", label: "All vendors" }, ...vendors.map((item) => ({ value: item.id, label: item.name }))]} placeholder="All vendors" size="sm" containerClassName="w-auto" className="min-w-44" /><Select value={status} onValueChange={(value) => resetPage(setStatus, value as InvoiceStatus | "")} options={[{ value: "", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }, { value: "cancelled", label: "Cancelled" }]} placeholder="All statuses" size="sm" containerClassName="w-auto" className="min-w-36" /><MonthPicker value={fiscalPeriod} onChange={(value) => resetPage(setFiscalPeriod, value || "")} size="sm" containerClassName="w-44" /><Input value={search} onChange={(event) => resetPage(setSearch, event.target.value)} placeholder="Search vendor or invoice" leftIcon={<Search className="h-4 w-4" />} size="sm" containerClassName="w-64" /></div>;
  const actions = <div className="flex gap-2">{canExport && <Button variant="outline" onClick={exportInvoices}><Download className="h-4 w-4" /> Export Excel</Button>}{canCreate && <Button onClick={() => { setEditing(null); setEditorOpen(true); }}><Plus className="h-4 w-4" /> Create Invoice</Button>}</div>;

  const noInvoices = !data?.total_count;
  const hasActiveFilters = Boolean(vendorId || status || fiscalPeriod || search.trim());
  const stats = [
    { label: "Total invoices", value: String(data?.total_count || 0), icon: FileText, iconClassName: "bg-blue-50 text-blue-600" },
    { label: "Total amount", value: money.format(Number(data?.total_amount || 0)), icon: IndianRupee, iconClassName: "bg-rose-50 text-rose-600" },
    { label: "Paid", value: money.format(Number(data?.paid_amount || 0)), icon: CheckCircle2, iconClassName: "bg-emerald-50 text-emerald-600" },
    { label: "Pending / overdue", value: money.format(Number(data?.pending_amount || 0) + Number(data?.overdue_amount || 0)), icon: Clock3, iconClassName: "bg-amber-50 text-amber-600" },
  ];
  return <>
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">{filters}{actions}</div>
      {noInvoices ? (
        <EmptyState
          icon={FileText}
          title={hasActiveFilters ? "No matching invoices" : "No invoices yet"}
          description={
            hasActiveFilters
              ? "Adjust the selected filters or clear the search to view invoices."
              : "Create the first vendor invoice for this association."
          }
          className="min-h-[420px]"
        />
      ) : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, iconClassName }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div></div>)}</div><DataTable data={data?.rows || []} columns={columns} enableGlobalFilter={false} enableColumnFilters={false} isLoading={isFetching} emptyTitle="No matching invoices" emptyMessage="Adjust the selected filters." pagination={{ isServer: true, pageIndex: page - 1, pageSize, pageSizeOptions: [10, 20, 25, 50, 100], totalCount: data?.total_count || 0, onPaginationChange: ({ pageIndex, pageSize: nextPageSize }) => { setPage(pageIndex + 1); setPageSize(nextPageSize); } }} /></>}
    </div>
    <InvoiceEditorModal isOpen={editorOpen || isCreateRouteOpen} associationId={association} invoice={editing} onClose={closeEditor} />
    <InvoicePreviewModal invoice={previewing} onClose={() => setPreviewing(null)} />
    <ConfirmDialog isOpen={Boolean(markingPaid)} onClose={() => setMarkingPaid(null)} onConfirm={async () => { if (!markingPaid) return; try { await updateInvoiceStatus({ id: markingPaid.id, associationId: association, status: "paid", paymentDate: new Date().toLocaleDateString("en-CA") }).unwrap(); toast.success("Invoice marked as paid"); setMarkingPaid(null); } catch (error) { toast.error(formatApiErrorDetail(error)); } }} title="Mark invoice as paid?" description={markingPaid ? `Invoice ${markingPaid.invoice_number} will be marked paid using today's date.` : undefined} confirmText="Mark as paid" isLoading={updateStatusState.isLoading} />
    <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={async () => { if (!deleting) return; try { await deleteInvoice({ id: deleting.id, associationId: association }).unwrap(); toast.success("Invoice deleted"); setDeleting(null); } catch (error) { toast.error(formatApiErrorDetail(error)); } }} title="Delete invoice?" description={deleting ? `Invoice ${deleting.invoice_number} will no longer appear in this association.` : undefined} confirmText="Delete invoice" isLoading={deleteState.isLoading} />
  </>;
};
