import React, { useEffect, useRef, useState } from "react";
import { Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

import { FormField, FormModal } from "@/components/common";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import apiClient from "@/services/api/apiClient";
import { useImportBalanceSheetMutation } from "../api";

interface BalanceSheetImportModalProps {
  isOpen: boolean;
  associationId: string;
  initialDate?: string;
  onClose: () => void;
  onImported: (date: string) => void;
}

const today = () => {
  const value = new Date();
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const BalanceSheetImportModal: React.FC<BalanceSheetImportModalProps> = ({
  isOpen,
  associationId,
  initialDate,
  onClose,
  onImported,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [asOnDate, setAsOnDate] = useState(today());
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [importBalanceSheet, { isLoading }] =
    useImportBalanceSheetMutation();

  useEffect(() => {
    if (isOpen) {
      setAsOnDate(initialDate || today());
      setFile(null);
      setFileError("");
    }
  }, [initialDate, isOpen]);

  const selectFile = (selected: File) => {
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      setFile(null);
      setFileError("Select an Excel workbook in .xlsx format");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFile(null);
      setFileError("The workbook must be 5 MB or smaller");
      return;
    }
    setFile(selected);
    setFileError("");
  };

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const response = await apiClient.get("/balance-sheets/template", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "balance_sheet_import_template.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to download the Balance Sheet template");
    } finally {
      setIsDownloading(false);
    }
  };

  const submit = async () => {
    if (!file) {
      setFileError("Select a completed Balance Sheet workbook");
      return;
    }
    try {
      const result = await importBalanceSheet({
        associationId,
        asOnDate,
        file,
      }).unwrap();
      toast.success(
        `Balance Sheet imported with ${result.imported_items ?? 0} items`,
      );
      onImported(asOnDate);
      onClose();
    } catch (error: any) {
      const message =
        typeof error?.data === "string"
          ? error.data
          : error?.data?.message || "Unable to import the Balance Sheet";
      setFileError(message);
      toast.error(message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Balance Sheet"
      description="Upload one balanced statement for the selected association and date"
      icon={<UploadCloud className="h-5 w-5 text-indigo-600" />}
      size="lg"
      isSubmitting={isLoading}
      submitText="Import Balance Sheet"
      loadingText="Validating workbook..."
      onSubmit={submit}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Start with the validated template
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Required: Section, Account Name, Amount. Account Code is optional.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isDownloading}
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download template"}
          </Button>
        </div>

        <FormField label="As-on date" required>
          <DatePicker
            value={asOnDate}
            onChange={(value) => setAsOnDate(value || "")}
            placeholder="Select date"
            displayFormat="MM/dd/yyyy"
          />
        </FormField>

        <FormField
          label="Excel workbook"
          required
          error={fileError}
          helperText="Only .xlsx files up to 5 MB are accepted"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) selectFile(selected);
            }}
          />
          {file ? (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <UploadCloud className="mb-2 h-7 w-7 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700">
                Choose Balance Sheet workbook
              </span>
              <span className="mt-1 text-xs text-slate-500">
                The import is saved only after every row passes validation
              </span>
            </button>
          )}
        </FormField>
      </div>
    </FormModal>
  );
};
