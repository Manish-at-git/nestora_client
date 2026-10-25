import React, { useRef, useState } from "react";
import { Download, LoaderCircle, Printer } from "lucide-react";
import { toast } from "sonner";

import { ModalWrapper } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { Invoice } from "../types";
import { downloadInvoicePdf } from "../utils/pdf";

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
}

interface InvoiceSheetProps {
  invoice: Invoice;
  printable?: boolean;
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const statusClassName = (status: Invoice["status"]) => {
  if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "overdue") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "cancelled") return "border-slate-200 bg-slate-100 text-slate-600";
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const taxLabel = (invoice: Invoice) => {
  const label = invoice.tax_type?.trim();
  return label?.includes("%") ? label : `${label || "Tax"} (${invoice.tax_rate}%)`;
};

const InvoiceSheet: React.FC<InvoiceSheetProps> = ({ invoice, printable = false }) => (
  <article
    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 ${
      printable ? "border-0 shadow-none" : ""
    }`}
  >
    <header className="flex items-start justify-between border-b border-slate-100 p-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
          N
        </div>
        <div>
          <p className="font-display text-lg font-bold text-slate-900">Nestora</p>
          <p className="text-[10px] text-slate-500">Association Management &amp; Billing</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-slate-900">{invoice.invoice_number}</p>
        <span className={`mt-1 inline-flex rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${statusClassName(invoice.status)}`}>
          {invoice.status}
        </span>
      </div>
    </header>

    <div className="space-y-5 p-5 text-xs">
      <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Issue date</p>
          <p className="mt-1 font-semibold">{invoice.issue_date}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Due date</p>
          <p className="mt-1 font-semibold">{invoice.due_date}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Terms</p>
          <p className="mt-1 font-semibold">{invoice.payment_terms || "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Billed by</p>
          <p className="mt-1 font-bold text-slate-900">{invoice.vendor_name}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{invoice.vendor_service}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400">Billed to</p>
          <p className="mt-1 font-bold text-slate-900">{invoice.association_name}</p>
          <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{invoice.billing_address}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_42px_82px] gap-2 bg-slate-50 px-3 py-2 text-[9px] font-bold uppercase text-slate-500">
          <span>Item / service</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Amount</span>
        </div>
        {invoice.lines.map((line) => (
          <div key={line.id} className="grid grid-cols-[1fr_42px_82px] gap-2 border-t border-slate-100 px-3 py-2 text-[10px]">
            <span className="truncate font-medium">{line.description}</span>
            <span className="text-right">{line.quantity}</span>
            <span className="text-right font-semibold">{money.format(Number(line.amount))}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_1.15fr] gap-3 border-t border-slate-100 pt-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[9px] font-bold uppercase text-slate-400">Payment account</p>
          {invoice.payment_account ? (
            <div className="mt-1 space-y-0.5 text-[10px] leading-relaxed text-slate-600">
              <p><span className="font-semibold text-slate-700">Bank:</span> {invoice.payment_account.bank_name}</p>
              <p><span className="font-semibold text-slate-700">A/C:</span> {invoice.payment_account.account_number}</p>
              <p><span className="font-semibold text-slate-700">IFSC:</span> {invoice.payment_account.ifsc_code}</p>
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">Vendor bank details are not available.</p>
          )}
        </div>
        <dl className="ml-auto grid w-full grid-cols-2 gap-y-2 text-right">
          <dt className="text-slate-500">Subtotal</dt>
          <dd className="font-semibold">{money.format(Number(invoice.subtotal))}</dd>
          <dt className="text-slate-500">Discount</dt>
          <dd className="font-semibold">- {money.format(Number(invoice.discount_amount))}</dd>
          <dt className="text-slate-500">{taxLabel(invoice)}</dt>
          <dd className="font-semibold">{money.format(Number(invoice.tax_amount))}</dd>
          <dt className="mt-2 border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">Grand total</dt>
          <dd className="mt-2 border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">{money.format(Number(invoice.grand_total))}</dd>
        </dl>
      </div>

      <div className="border-t border-slate-100 pt-3">
        <p className="text-[9px] font-bold uppercase text-slate-400">Notes</p>
        <p className="mt-1 whitespace-pre-line text-[10px] leading-relaxed text-slate-500">
          {invoice.notes || "No customer notes have been added."}
        </p>
      </div>
    </div>
  </article>
);

export const InvoicePreviewModal: React.FC<Props> = ({
  invoice,
  onClose,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!invoice) return null;

  const handleDownloadPdf = async () => {
    if (!sheetRef.current) return;
    try {
      setIsDownloading(true);
      await downloadInvoicePdf(sheetRef.current, invoice.invoice_number);
    } catch {
      toast.error("Unable to create the invoice PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 0; }
          body * { visibility: hidden !important; }
          .invoice-print-document,
          .invoice-print-document * { visibility: visible !important; }
          .invoice-print-document {
            display: block !important;
            position: fixed;
            inset: 0;
            box-sizing: border-box;
            width: 100%;
            padding: 6mm;
            background: #ffffff;
          }
        }
      `}</style>

      <div className="invoice-print-document hidden">
        <InvoiceSheet invoice={invoice} printable />
      </div>

      <ModalWrapper
        isOpen
        onClose={onClose}
        size="3xl"
        className="sm:max-w-[680px]"
        bodyClassName="bg-slate-50 p-5 sm:p-6"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isDownloading ? "Preparing PDF" : "Download PDF"}
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </div>
        }
      >
        <div ref={sheetRef}>
          <InvoiceSheet invoice={invoice} />
        </div>
      </ModalWrapper>
    </>
  );
};
