import React, { useEffect, useMemo, useState } from "react";
import { FileText, Plus, ReceiptText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useGetAssociationsQuery } from "@/features/associations/api";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useCreateInvoiceMutation,
  useGetInvoiceVendorsQuery,
  useUpdateInvoiceMutation,
} from "../api";
import type {
  DiscountType,
  Invoice,
  InvoiceLinePayload,
  InvoicePayload,
  InvoiceStatus,
} from "../types";

interface Props {
  isOpen: boolean;
  associationId: string;
  invoice: Invoice | null;
  onClose: () => void;
}

type FormState = Omit<InvoicePayload, "association_id">;
type FormErrors = Partial<Record<"vendor_id" | "billing_address" | "payment_terms" | "lines" | "dates", string>>;

const today = () => new Date().toISOString().slice(0, 10);
const blankLine = (): InvoiceLinePayload => ({ description: "", quantity: "1", rate: "0" });
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const taxOptions = [
  { value: "", label: "Select tax" },
  { value: "IGST (18%)", label: "IGST (18%)", rate: "18" },
  { value: "IGST (12%)", label: "IGST (12%)", rate: "12" },
  { value: "IGST (5%)", label: "IGST (5%)", rate: "5" },
  { value: "CGST (9%) + SGST (9%)", label: "CGST (9%) + SGST (9%)", rate: "18" },
  { value: "CGST (9%)", label: "CGST (9%)", rate: "9" },
  { value: "SGST (9%)", label: "SGST (9%)", rate: "9" },
  { value: "Exempt / Zero (0%)", label: "Exempt / Zero (0%)", rate: "0" },
];

const createEmptyForm = (): FormState => ({
  vendor_id: "",
  billing_address: "",
  invoice_number: "",
  issue_date: today(),
  due_date: today(),
  payment_terms: "",
  lines: [blankLine()],
  discount_type: "none",
  discount_value: "0",
  tax_type: "",
  tax_rate: "0",
  notes: "",
  status: "pending",
  payment_date: null,
  payment_method: null,
});

const associationAddress = (association?: {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
}): string => {
  if (!association) return "";
  return [
    association.address_line_1,
    association.address_line_2,
    association.city,
    association.state,
    association.pincode,
    association.country,
  ]
    .filter(Boolean)
    .join(", ");
};

export const InvoiceEditorModal: React.FC<Props> = ({
  isOpen,
  associationId,
  invoice,
  onClose,
}) => {
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [createInvoice, createState] = useCreateInvoiceMutation();
  const [updateInvoice, updateState] = useUpdateInvoiceMutation();
  const { data: vendors = [] } = useGetInvoiceVendorsQuery(associationId, {
    skip: !isOpen || !associationId,
  });
  const { data: associations = [] } = useGetAssociationsQuery(undefined, {
    skip: !isOpen,
  });
  const association = associations.find((item) => item.id === associationId);
  const selectedVendor = vendors.find((item) => item.id === form.vendor_id);

  useEffect(() => {
    if (!isOpen) return;

    setError("");
    setFormErrors({});
    if (invoice) {
      setForm({
        vendor_id: invoice.vendor_id || "",
        billing_address: invoice.billing_address || "",
        invoice_number: invoice.invoice_number,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        payment_terms: invoice.payment_terms || "",
        lines: invoice.lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          rate: line.rate,
        })),
        discount_type: invoice.discount_type,
        discount_value: invoice.discount_value,
        tax_type: invoice.tax_type,
        tax_rate: invoice.tax_rate,
        notes: invoice.notes,
        status: invoice.status,
        payment_date: invoice.payment_date,
        payment_method: invoice.payment_method,
      });
      return;
    }

    setForm({ ...createEmptyForm(), billing_address: associationAddress(association) });
  }, [association?.id, invoice, isOpen]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateLine = (index: number, key: keyof InvoiceLinePayload, value: string) => {
    setForm((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) =>
        lineIndex === index ? { ...line, [key]: value } : line,
      ),
    }));
  };

  const preview = useMemo(() => {
    const subtotal = form.lines.reduce(
      (sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.rate) || 0),
      0,
    );
    const discount = form.discount_type === "percentage"
      ? subtotal * (Number(form.discount_value) || 0) / 100
      : form.discount_type === "flat"
        ? Number(form.discount_value) || 0
        : 0;
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * (Number(form.tax_rate) || 0) / 100;
    return { subtotal, discount, tax, total: taxable + tax };
  }, [form.discount_type, form.discount_value, form.lines, form.tax_rate]);

  const submit = async () => {
    const validationErrors: FormErrors = {};
    if (!form.vendor_id) validationErrors.vendor_id = "Select an active vendor.";
    if (!form.billing_address.trim()) validationErrors.billing_address = "Billing address is required.";
    if (!form.payment_terms.trim()) validationErrors.payment_terms = "Payment terms are required.";
    if (form.due_date < form.issue_date) validationErrors.dates = "Due date cannot be before issue date.";
    if (form.lines.some((line) => !line.description.trim() || Number(line.quantity) <= 0 || Number(line.rate) < 0)) {
      validationErrors.lines = "Each item needs a description, a quantity above zero, and a non-negative cost.";
    }
    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      setError("Complete the highlighted required fields before creating the invoice.");
      return;
    }

    try {
      setError("");
      setFormErrors({});
      const payload: InvoicePayload = { ...form, association_id: associationId };
      if (invoice) await updateInvoice({ id: invoice.id, data: payload }).unwrap();
      else await createInvoice(payload).unwrap();
      toast.success(invoice ? "Invoice updated" : "Invoice created");
      onClose();
    } catch (requestError) {
      setError(formatApiErrorDetail(requestError));
    }
  };

  const selectVendor = (vendorId: string) => {
    const vendor = vendors.find((item) => item.id === vendorId);
    setForm((current) => ({
      ...current,
      vendor_id: vendorId,
      payment_terms: current.payment_terms || vendor?.payment_terms || "",
    }));
    setFormErrors((current) => ({ ...current, vendor_id: undefined }));
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? "Update Invoice" : "Create New Invoice"}
      description="The selected association is taken from the global association switcher. Totals are verified on the server."
      icon={<ReceiptText className="h-5 w-5" />}
      size="5xl"
      className="sm:max-w-[1280px]"
      onSubmit={submit}
      isSubmitting={createState.isLoading || updateState.isLoading}
      submitText={invoice ? "Save Invoice" : "Create Invoice"}
      contentClassName="p-4 sm:p-5"
      footerClassName="px-4 sm:px-5"
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-7">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Invoice details</h3>
            <p className="mt-1 text-xs text-slate-500">Complete the bill-to, vendor, and payment information.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Customer (association)"
              required
              value={association?.name || "Selected association"}
              readOnly
              helperText="Change the association using the global selector."
              className="bg-slate-50"
            />
            <Input
              label="Invoice number"
              value={invoice?.invoice_number || "Generated automatically"}
              readOnly
              helperText={invoice ? "Assigned by the server." : "Assigned by the server when this invoice is created."}
              className="bg-slate-50"
            />
            <Textarea
              containerClassName="sm:col-span-2"
              label="Billing address"
              required
              value={form.billing_address || ""}
              onChange={(event) => update("billing_address", event.target.value)}
              rows={2}
              helperText="Pre-filled from the selected association when available."
              error={formErrors.billing_address}
            />
            <Select
              label="Vendor"
              required
              value={form.vendor_id}
              onValueChange={selectVendor}
              options={vendors.map((item) => ({
                value: item.id,
                label: `${item.name} · ${item.service_type}`,
              }))}
              placeholder="Select active vendor"
              error={formErrors.vendor_id}
            />
            <Input
              label="Vendor service"
              value={selectedVendor?.service_type || "Select a vendor"}
              readOnly
              className="bg-slate-50"
            />
            <DatePicker
              label="Issue date"
              required
              value={form.issue_date}
              onChange={(value) => update("issue_date", value || "")}
            />
            <DatePicker
              label="Due date"
              required
              value={form.due_date}
              onChange={(value) => update("due_date", value || "")}
            />
            <Input
              label="Payment terms"
              required
              value={form.payment_terms || ""}
              onChange={(event) => update("payment_terms", event.target.value)}
              placeholder="e.g. Net 30"
              error={formErrors.payment_terms}
            />
            <Select
              label="Payment status"
              value={form.status}
              onValueChange={(value) => update("status", value as InvoiceStatus)}
              options={[
                { value: "pending", label: "Pending" },
                { value: "overdue", label: "Overdue" },
                { value: "paid", label: "Paid" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
            {form.status === "paid" && (
              <>
                <DatePicker
                  label="Payment date"
                  required
                  value={form.payment_date || ""}
                  onChange={(value) => update("payment_date", value || null)}
                />
                <Input
                  label="Payment method"
                  value={form.payment_method || ""}
                  onChange={(event) => update("payment_method", event.target.value)}
                />
              </>
            )}
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">Items / service details</h4>
                <p className="mt-1 text-xs text-slate-500">Each invoice must contain at least one item.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => update("lines", [...form.lines, blankLine()])}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-12 gap-2 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
                <span className="col-span-5">Item / service</span><span className="col-span-2">Qty</span><span className="col-span-2">Cost (₹)</span><span className="col-span-2 text-right">Amount (₹)</span><span />
              </div>
              <div className="divide-y divide-slate-100">
                {form.lines.map((line, index) => {
                  const amount = (Number(line.quantity) || 0) * (Number(line.rate) || 0);
                  return (
                    <div key={index} className="grid gap-2 p-3 sm:grid-cols-12 sm:items-center">
                      <div className="sm:col-span-5"><Input aria-label={`Item ${index + 1} description`} placeholder="Item or service" value={line.description} onChange={(event) => updateLine(index, "description", event.target.value)} /></div>
                      <div className="sm:col-span-2"><Input aria-label={`Item ${index + 1} quantity`} type="number" min="0.0001" step="0.0001" value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} /></div>
                      <div className="sm:col-span-2"><Input aria-label={`Item ${index + 1} cost`} type="number" min="0" step="0.01" value={line.rate} onChange={(event) => updateLine(index, "rate", event.target.value)} /></div>
                      <p className="sm:col-span-2 text-right text-sm font-bold tabular-nums text-slate-800">{money.format(amount)}</p>
                      <Button type="button" variant="ghost" size="iconSm" aria-label={`Remove item ${index + 1}`} disabled={form.lines.length === 1} onClick={() => update("lines", form.lines.filter((_, lineIndex) => lineIndex !== index))}>
                        <Trash2 className="h-4 w-4 text-rose-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
            {formErrors.lines && <p className="text-xs text-rose-600">{formErrors.lines}</p>}
            {formErrors.dates && <p className="text-xs text-rose-600">{formErrors.dates}</p>}
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <Select
                label="Discount"
                value={form.discount_type}
                onValueChange={(value) => {
                  update("discount_type", value as DiscountType);
                  if (value === "none") update("discount_value", "0");
                }}
                options={[
                  { value: "none", label: "No discount" },
                  { value: "flat", label: "Flat amount" },
                  { value: "percentage", label: "Percentage" },
                ]}
              />
              <Input label="Discount value" type="number" min="0" step="0.01" disabled={form.discount_type === "none"} value={form.discount_value} onChange={(event) => update("discount_value", event.target.value)} />
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <Select
                label="Tax details"
                value={form.tax_type || ""}
                onValueChange={(value) => {
                  const option = taxOptions.find((item) => item.value === value);
                  update("tax_type", value || null);
                  update("tax_rate", option?.rate || "0");
                }}
                options={taxOptions}
              />
              <p className="mt-2 text-[10px] font-semibold text-blue-600">
                Calculated tax: {money.format(preview.tax)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-300/40">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total amount</p>
              <p className="mt-1 text-2xl font-bold tracking-tight">{money.format(preview.total)}</p>
              <div className="mt-3 border-t border-slate-700 pt-2 text-[10px] text-slate-400">Subtotal {money.format(preview.subtotal)} · Net tax {money.format(preview.tax)}</div>
            </div>
          </div>

          <Textarea
            label="Notes to customer"
            value={form.notes || ""}
            onChange={(event) => update("notes", event.target.value)}
            rows={2}
            placeholder="Optional payment or service notes"
          />
          {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        </section>

        <aside className="lg:col-span-5 lg:sticky lg:top-0 lg:self-start">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live preview
          </div>
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">N</div><div><p className="font-display text-lg font-bold text-slate-900">Nestora</p><p className="text-[10px] text-slate-500">Association Management & Billing</p></div></div>
              <div className="text-right"><p className="text-xs font-bold text-slate-900">{invoice?.invoice_number || "Assigned on save"}</p><span className="mt-1 inline-flex rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">{form.status}</span></div>
            </div>
            <div className="space-y-5 p-5 text-xs">
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3"><div><p className="text-[9px] font-bold uppercase text-slate-400">Issue date</p><p className="mt-1 font-semibold">{form.issue_date || "—"}</p></div><div><p className="text-[9px] font-bold uppercase text-slate-400">Due date</p><p className="mt-1 font-semibold">{form.due_date || "—"}</p></div><div><p className="text-[9px] font-bold uppercase text-slate-400">Terms</p><p className="mt-1 font-semibold">{form.payment_terms || "—"}</p></div></div>
              <div className="grid grid-cols-2 gap-5"><div><p className="text-[9px] font-bold uppercase text-slate-400">Billed by</p><p className="mt-1 font-bold text-slate-900">{selectedVendor?.name || "Selected vendor"}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-500">{selectedVendor?.service_type || "Vendor service will appear here."}</p></div><div><p className="text-[9px] font-bold uppercase text-slate-400">Billed to</p><p className="mt-1 font-bold text-slate-900">{association?.name || "Selected association"}</p><p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-slate-500">{form.billing_address || "Billing address"}</p></div></div>
              <div className="overflow-hidden rounded-xl border border-slate-200"><div className="grid grid-cols-[1fr_42px_82px] gap-2 bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase text-slate-500"><span>Item / service</span><span className="text-right">Qty</span><span className="text-right">Amount</span></div>{form.lines.map((line, index) => <div key={index} className="grid grid-cols-[1fr_42px_82px] gap-2 border-t border-slate-100 px-3 py-2 text-[10px]"><span className="truncate font-medium">{line.description || "Item / service"}</span><span className="text-right">{line.quantity || "0"}</span><span className="text-right font-semibold">{money.format((Number(line.quantity) || 0) * (Number(line.rate) || 0))}</span></div>)}</div>
              <div className="grid grid-cols-[1fr_1.15fr] gap-3 border-t border-slate-100 pt-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[9px] font-bold uppercase text-slate-400">Payment account</p>
                  {selectedVendor?.payment_account ? (
                    <div className="mt-1 space-y-0.5 text-[10px] leading-relaxed text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-700">Bank:</span>{" "}
                        {selectedVendor.payment_account.bank_name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">A/C:</span>{" "}
                        {selectedVendor.payment_account.account_number}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">IFSC:</span>{" "}
                        {selectedVendor.payment_account.ifsc_code}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-[10px] text-slate-500">The selected vendor has no bank details.</p>
                  )}
                </div>
                <div className="ml-auto grid w-full grid-cols-2 gap-y-2 text-right">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold">{money.format(preview.subtotal)}</span>
                  <span className="text-slate-500">Discount</span>
                  <span className="font-semibold">- {money.format(preview.discount)}</span>
                  <span className="text-slate-500">
                    {form.tax_type || "Tax"} 
                  </span>
                  <span className="font-semibold">{money.format(preview.tax)}</span>
                  <span className="mt-2 border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                    Grand total
                  </span>
                  <span className="mt-2 border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                    {money.format(preview.total)}
                  </span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3"><p className="text-[9px] font-bold uppercase text-slate-400">Notes</p><p className="mt-1 whitespace-pre-line text-[10px] leading-relaxed text-slate-500">{form.notes || "No customer notes have been added."}</p></div>
            </div>
          </article>
          <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><FileText className="h-4 w-4" /> Preview values are recalculated on the server when saved.</p>
        </aside>
      </div>
    </FormModal>
  );
};
