import React, { useMemo, useState } from "react";
import { CheckCircle2, CircleCheckBig, Clock3, Download, Eye, FileText, IndianRupee, MoreHorizontal, Pencil, Plus, Search, Trash2, UploadCloud } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { AccessRestricted, ConfirmDialog, DataTable, EmptyState, LoadingSpinner, MonthPicker } from "@/components/common";
import type { Column } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FEATURES } from "@/constants/featureCodes";
import { isFinancialViewOnlyRole } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import { useGetDocumentsQuery } from "@/features/documents/api";
import { useDeleteInvoiceMutation, useGetInvoicesQuery, useGetInvoiceVendorsQuery, useUpdateInvoiceStatusMutation } from "../api";
import { InvoiceEditorModal, InvoicePreviewModal, InvoiceUploadModal } from "../components";
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
  const [uploadOpen, setUploadOpen] = useState(false);
  const skip = !canView || !associationId || associationId === "ALL";
  const association = String(associationId || "");
  const { data, isLoading, isFetching, isError } = useGetInvoicesQuery({ associationId: association, vendorId: vendorId || undefined, status: status || undefined, fiscalPeriod: fiscalPeriod || undefined, search: search.trim() || undefined, page, pageSize }, { skip });
  const { data: vendors = [] } = useGetInvoiceVendorsQuery(association, { skip });
  const { data: documents = [], refetch: refetchDocuments } = useGetDocumentsQuery({ association_id: association }, { skip });
  const [deleteInvoice, deleteState] = useDeleteInvoiceMutation();
  const [updateInvoiceStatus, updateStatusState] = useUpdateInvoiceStatusMutation();

  const uploadedInvoices = useMemo<Invoice[]>(() => documents
    .filter((document) => document.document_type === "Finance" && document.category === "Vendor Invoices" && document.file_url)
    .map((document) => {
      const [vendorName, invoiceNumberFromTitle] = document.title.split(" — ");
      return {
        id: `uploaded-${document.id}`,
        association_id: document.association_id,
        association_name: document.association_name || "",
        vendor_id: null,
        vendor_name: vendorName || "Third-party vendor",
        vendor_service: "Third-party vendor",
        payment_account: null,
        billing_address: null,
        invoice_number: document.document_number || invoiceNumberFromTitle || "Uploaded invoice",
        issue_date: document.issue_date || "",
        due_date: "",
        fiscal_period: document.issue_date?.slice(0, 7) || "",
        payment_terms: null,
        lines: [{ id: document.id, description: "Third-party uploaded invoice", quantity: "1", rate: "0", amount: "0", sort_order: 0 }],
        discount_type: "none",
        discount_value: "0",
        tax_type: null,
        tax_rate: "0",
        notes: null,
        subtotal: "0",
        discount_amount: "0",
        tax_amount: "0",
        grand_total: "0",
        status: "pending",
        payment_date: null,
        payment_method: null,
        is_third_party_upload: true,
        uploaded_file_url: document.file_url,
      };
    }), [documents]);

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
    { key: "invoice_number", header: "Invoice no.", render: (row) => <p className="font-semibold text-blue-600">{row.invoice_number}{row.is_third_party_upload && <span className="ml-2 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">Uploaded</span>}</p> },
    { key: "vendor_name", header: "Vendor", render: (row) => <p className="font-semibold text-slate-800">{row.vendor_name}</p> },
    { key: "description", header: "Description", render: (row) => <p className="max-w-52 truncate text-slate-600">{row.lines[0]?.description || "—"}</p> },
    { key: "issue_date", header: "Invoice date", render: (row) => row.issue_date ? new Date(`${row.issue_date}T00:00:00`).toLocaleDateString("en-IN") : "—" },
    { key: "due_date", header: "Due date", render: (row) => row.due_date ? new Date(`${row.due_date}T00:00:00`).toLocaleDateString("en-IN") : "—" },
    { key: "grand_total", header: "Amount (₹)", className: "text-right font-mono font-semibold", headerClassName: "text-right", render: (row) => row.is_third_party_upload ? "—" : money.format(Number(row.grand_total)) },
    { key: "status", header: "Status", render: (row) => row.is_third_party_upload ? <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">Uploaded</span> : <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${row.status === "paid" ? "bg-emerald-50 text-emerald-700" : row.status === "overdue" ? "bg-rose-50 text-rose-700" : row.status === "cancelled" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{row.status}</span> },
    { key: "actions", header: "Actions", width: 160, sortable: false, render: (row) => <div className="flex justify-center gap-1">{row.is_third_party_upload ? <Button variant="ghost" size="iconSm" aria-label="Open uploaded invoice" onClick={() => window.open(row.uploaded_file_url || "", "_blank", "noopener,noreferrer")}><Eye className="h-4 w-4" /></Button> : <><Button variant="ghost" size="iconSm" aria-label="View invoice" onClick={() => setPreviewing(row)}><Eye className="h-4 w-4" /></Button>{canUpdate && <Button variant="ghost" size="iconSm" aria-label="Edit invoice" onClick={() => { setEditing(row); setEditorOpen(true); }}><Pencil className="h-4 w-4" /></Button>}{canUpdate && (row.status === "pending" || row.status === "overdue") && <Button variant="ghost" size="iconSm" aria-label="Mark invoice as paid" onClick={() => setMarkingPaid(row)}><CircleCheckBig className="h-4 w-4 text-emerald-600" /></Button>}{canDelete && <Button variant="ghost" size="iconSm" aria-label="Delete invoice" onClick={() => setDeleting(row)}><Trash2 className="h-4 w-4 text-rose-500" /></Button>}</>}</div> },
  ], [canDelete, canUpdate]);

  if (permissionsLoading || (isLoading && !data)) return <LoadingSpinner />;
  if (!canView) return <AccessRestricted moduleName="Invoice" showAction />;
  if (!associationId || associationId === "ALL") return <EmptyState icon={FileText} title="Select an association" description="Choose one association to view its invoices. All Associations is not used for financial records." className="min-h-[420px]" />;
  if (isError) return <EmptyState icon={FileText} title="Unable to load invoices" description="Please try again." className="min-h-[420px]" />;

  const filters = <div className="flex flex-wrap gap-2"><Select value={vendorId} onValueChange={(value) => resetPage(setVendorId, value)} options={[{ value: "", label: "All vendors" }, ...vendors.map((item) => ({ value: item.id, label: item.name }))]} placeholder="All vendors" size="sm" containerClassName="w-auto" className="min-w-44" /><Select value={status} onValueChange={(value) => resetPage(setStatus, value as InvoiceStatus | "")} options={[{ value: "", label: "All statuses" }, { value: "pending", label: "Pending" }, { value: "overdue", label: "Overdue" }, { value: "paid", label: "Paid" }, { value: "cancelled", label: "Cancelled" }]} placeholder="All statuses" size="sm" containerClassName="w-auto" className="min-w-36" /><MonthPicker value={fiscalPeriod} onChange={(value) => resetPage(setFiscalPeriod, value || "")} size="sm" containerClassName="w-44" /><Input value={search} onChange={(event) => resetPage(setSearch, event.target.value)} placeholder="Search vendor or invoice" leftIcon={<Search className="h-4 w-4" />} size="sm" containerClassName="w-64" /></div>;
  const actions = <div className="flex gap-2">
    {canExport && <Button variant="outline" onClick={exportInvoices}><Download className="h-4 w-4" /> Export Excel</Button>}
    {canCreate && <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="iconSm" aria-label="Invoice actions" title="Invoice actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={() => { setEditing(null); setEditorOpen(true); }}>
          <Plus className="h-4 w-4" /> Create Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setUploadOpen(true)}>
          <UploadCloud className="h-4 w-4" /> Upload Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>}
  </div>;

  const filteredUploadedInvoices = uploadedInvoices.filter((invoice) => {
    const matchesSearch = !search.trim() || `${invoice.vendor_name} ${invoice.invoice_number}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesPeriod = !fiscalPeriod || invoice.issue_date.startsWith(fiscalPeriod);
    return matchesSearch && matchesPeriod && !vendorId && !status;
  });
  const visibleRows = page === 1 ? [...filteredUploadedInvoices, ...(data?.rows || [])] : data?.rows || [];
  const noInvoices = visibleRows.length === 0;
  const hasActiveFilters = Boolean(vendorId || status || fiscalPeriod || search.trim());
  const stats = [
    { label: "Total invoices", value: String((data?.total_count || 0) + uploadedInvoices.length), icon: FileText, iconClassName: "bg-blue-50 text-blue-600" },
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
      ) : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, iconClassName }) => <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}><Icon className="h-5 w-5" /></div><div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div></div>)}</div><DataTable data={visibleRows} columns={columns} enableGlobalFilter={false} enableColumnFilters={false} isLoading={isFetching} emptyTitle="No matching invoices" emptyMessage="Adjust the selected filters." pagination={{ isServer: true, pageIndex: page - 1, pageSize, pageSizeOptions: [10, 20, 25, 50, 100], totalCount: (data?.total_count || 0) + filteredUploadedInvoices.length, onPaginationChange: ({ pageIndex, pageSize: nextPageSize }) => { setPage(pageIndex + 1); setPageSize(nextPageSize); } }} /></>}
    </div>
    <InvoiceEditorModal isOpen={editorOpen || isCreateRouteOpen} associationId={association} invoice={editing} onClose={closeEditor} />
    <InvoiceUploadModal isOpen={uploadOpen} associationId={association} onClose={() => setUploadOpen(false)} onUploaded={() => { void refetchDocuments(); }} />
    <InvoicePreviewModal invoice={previewing} onClose={() => setPreviewing(null)} />
    <ConfirmDialog isOpen={Boolean(markingPaid)} onClose={() => setMarkingPaid(null)} onConfirm={async () => { if (!markingPaid) return; try { await updateInvoiceStatus({ id: markingPaid.id, associationId: association, status: "paid", paymentDate: new Date().toLocaleDateString("en-CA") }).unwrap(); toast.success("Invoice marked as paid"); setMarkingPaid(null); } catch (error) { toast.error(formatApiErrorDetail(error)); } }} title="Mark invoice as paid?" description={markingPaid ? `Invoice ${markingPaid.invoice_number} will be marked paid using today's date.` : undefined} confirmText="Mark as paid" isLoading={updateStatusState.isLoading} />
    <ConfirmDialog isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={async () => { if (!deleting) return; try { await deleteInvoice({ id: deleting.id, associationId: association }).unwrap(); toast.success("Invoice deleted"); setDeleting(null); } catch (error) { toast.error(formatApiErrorDetail(error)); } }} title="Delete invoice?" description={deleting ? `Invoice ${deleting.invoice_number} will no longer appear in this association.` : undefined} confirmText="Delete invoice" isLoading={deleteState.isLoading} />
  </>;
};
