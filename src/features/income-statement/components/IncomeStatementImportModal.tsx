import React, { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { FormField, FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import apiClient from "@/services/api/apiClient";
import { useImportIncomeStatementMutation } from "../api";

interface Props { isOpen: boolean; associationId: string; initialPeriod: string; onClose: () => void; onImported: (period: string) => void; }

export const IncomeStatementImportModal: React.FC<Props> = ({ isOpen, associationId, initialPeriod, onClose, onImported }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [importStatement, state] = useImportIncomeStatementMutation();
  useEffect(() => { if (!isOpen) return; const parts = initialPeriod.split(" - "); const parse = (value: string) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10); }; setStart(parse(parts[0] || "")); setEnd(parse(parts[1] || "")); setFile(null); setError(""); }, [initialPeriod, isOpen]);
  const period = `${start} - ${end}`;
  const submit = async () => { if (!file || !start || !end) { setError("Choose a fiscal period and workbook."); return; } try { await importStatement({ associationId, fiscalPeriod: period, file }).unwrap(); toast.success("Income Statement imported successfully"); onImported(period); onClose(); } catch (requestError: any) { const message = requestError?.data?.message || "Unable to import the Income Statement"; setError(message); toast.error(message); } };
  const downloadTemplate = async () => { const response = await apiClient.get("/income-statements/template", { responseType: "blob" }); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = "income_statement_import_template.xlsx"; link.click(); URL.revokeObjectURL(url); };
  return <FormModal isOpen={isOpen} onClose={onClose} title="Import Income Statement" description="Upload one fiscal-period statement for the selected association" icon={<UploadCloud className="h-5 w-5 text-indigo-600" />} size="lg" isSubmitting={state.isLoading} submitText="Import Income Statement" loadingText="Validating workbook..." onSubmit={submit}><div className="space-y-5"><div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"><div><p className="text-sm font-semibold text-slate-800">Use the validated template</p><p className="mt-1 text-xs text-slate-500">Type, Particular, Current Year, Previous Year</p></div><Button type="button" variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4" /> Download template</Button></div><FormField label="Fiscal period" required><div className="flex items-center gap-2"><DatePicker value={start} onChange={(value) => setStart(value || "")} placeholder="Start date" displayFormat="MMM d, yyyy" /><span className="text-xs text-slate-500">to</span><DatePicker value={end} onChange={(value) => setEnd(value || "")} placeholder="End date" displayFormat="MMM d, yyyy" /></div></FormField><FormField label="Excel workbook" required error={error} helperText="Only .xlsx files up to 5 MB are accepted"><input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} /><button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/40 p-8 text-sm text-slate-600"><FileSpreadsheet className="mb-2 h-7 w-7 text-indigo-500" />{file ? file.name : "Choose Income Statement workbook"}</button></FormField></div></FormModal>;
};
