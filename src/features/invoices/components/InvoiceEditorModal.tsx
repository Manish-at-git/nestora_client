import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import { useCreateInvoiceMutation, useUpdateInvoiceMutation } from "../api";
import type { Invoice, InvoicePayload, InvoiceStatus } from "../types";

interface Props { isOpen: boolean; associationId: string; invoice: Invoice | null; onClose: () => void; }
const today = () => new Date().toISOString().slice(0, 10);

export const InvoiceEditorModal: React.FC<Props> = ({ isOpen, associationId, invoice, onClose }) => {
  const [form, setForm] = useState<Omit<InvoicePayload, "association_id">>({ invoice_number: "", vendor_name: "", category: "", description: "", invoice_date: today(), due_date: today(), subtotal: "0", tax_percentage: "0", status: "pending", payment_date: null, payment_method: null });
  const [error, setError] = useState("");
  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [updateInvoice, updateState] = useUpdateInvoiceMutation();
  useEffect(() => { if (isOpen) setForm(invoice ? { invoice_number: invoice.invoice_number, vendor_name: invoice.vendor_name, category: invoice.category, description: invoice.description, invoice_date: invoice.invoice_date, due_date: invoice.due_date, subtotal: invoice.subtotal, tax_percentage: invoice.tax_percentage, status: invoice.status, payment_date: invoice.payment_date, payment_method: invoice.payment_method } : { invoice_number: "", vendor_name: "", category: "", description: "", invoice_date: today(), due_date: today(), subtotal: "0", tax_percentage: "0", status: "pending", payment_date: null, payment_method: null }); setError(""); }, [isOpen, invoice]);
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async () => { try { const payload = { ...form, association_id: associationId }; if (invoice) await updateInvoice({ id: invoice.id, data: payload }).unwrap(); else await createInvoice(payload).unwrap(); toast.success(invoice ? "Invoice updated" : "Invoice created"); onClose(); } catch (requestError) { setError(formatApiErrorDetail(requestError)); } };
  return <FormModal isOpen={isOpen} onClose={onClose} title={invoice ? "Update Invoice" : "Create Invoice"} description="Record one vendor invoice for the selected association" size="2xl" onSubmit={submit} isSubmitting={createState.isLoading || updateState.isLoading} submitText={invoice ? "Save Invoice" : "Create Invoice"}>
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Invoice number" required value={form.invoice_number} onChange={(e) => update("invoice_number", e.target.value)} />
      <Select label="Status" value={form.status} onValueChange={(value) => update("status", value as InvoiceStatus)} options={[{ value: "pending", label: "Pending" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} />
      <Input label="Vendor name" required value={form.vendor_name} onChange={(e) => update("vendor_name", e.target.value)} />
      <Input label="Category" required value={form.category} onChange={(e) => update("category", e.target.value)} />
      <div className="sm:col-span-2"><Input label="Description" value={form.description || ""} onChange={(e) => update("description", e.target.value)} /></div>
      <DatePicker label="Invoice date" value={form.invoice_date} onChange={(value) => update("invoice_date", value || "")} />
      <DatePicker label="Due date" value={form.due_date} onChange={(value) => update("due_date", value || "")} />
      <Input label="Subtotal" type="number" min="0" step="0.01" value={form.subtotal} onChange={(e) => update("subtotal", e.target.value)} />
      <Input label="Tax percentage" type="number" min="0" step="0.01" value={form.tax_percentage} onChange={(e) => update("tax_percentage", e.target.value)} />
      {form.status === "paid" && <><DatePicker label="Payment date" value={form.payment_date || ""} onChange={(value) => update("payment_date", value || null)} /><Input label="Payment method" value={form.payment_method || ""} onChange={(e) => update("payment_method", e.target.value)} /></>}
    </div>
    {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
  </FormModal>;
};
