import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal, FormField } from "@/components/common";
import { toast } from "sonner";
import { useUploadChartOfAccountsMutation } from "@/features/chart-of-accounts/api";
import { cn } from "@/lib/utils";

export interface UploadCOAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadCOAModal: React.FC<UploadCOAModalProps> = ({
  isOpen,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string>("");

  const [uploadCOA, { isLoading: isUploading }] = useUploadChartOfAccountsMutation();

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setFileError("");
      setIsDragging(false);
    }
  }, [isOpen]);

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExtension) {
      setFileError("Invalid file format. Please select an Excel file (.xlsx, .xls) or CSV");
      return false;
    }

    const maxSizeBytes = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSizeBytes) {
      setFileError("File is too large. Maximum allowed size is 15MB");
      return false;
    }

    setFileError("");
    setSelectedFile(file);
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDownloadSample = () => {
    const headers = "gl_code,gl_name,structure,grouping\n";
    const sampleRows = [
      "1010,Cash & Bank Balances,Asset,Current Assets",
      "1020,Resident Maintenance Receivables,Asset,Current Assets",
      "1050,Fixed Deposits & Sinking Funds,Asset,Investments",
      "2010,Vendor Accounts Payable,Liability,Current Liabilities",
      "2050,Advance Maintenance Deposits,Liability,Current Liabilities",
      "3010,Corpus / Sinking Fund Reserve,Equity,Reserves & Surplus",
      "4010,Monthly Maintenance Assessment,Income,Operating Revenue",
      "4020,Clubhouse & Amenity Booking Fees,Income,Non-Operating Revenue",
      "5010,Security Services Expense,Expense,Operating Expenses",
      "5020,Electricity & Common Utilities,Expense,Operating Expenses",
      "5030,Housekeeping & Waste Management,Expense,Operating Expenses",
    ].join("\n");

    const blob = new Blob([headers + sampleRows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "nestora_chart_of_accounts_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sample template downloaded!");
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setFileError("Please select a spreadsheet file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await uploadCOA(formData).unwrap();
      toast.success(res.message || "Chart of Accounts imported successfully!");
      onClose();
      setSelectedFile(null);
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.data || err?.message || "Failed to upload chart of accounts";
      setFileError(typeof errorMsg === "string" ? errorMsg : "Import failed");
      toast.error(errorMsg);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Chart of Accounts"
      description="Bulk upload standardized general ledger accounting codes from spreadsheet"
      icon={<UploadCloud className="w-5 h-5 text-indigo-600" />}
      size="lg"
      isSubmitting={isUploading}
      submitText="Import Chart of Accounts"
      loadingText="Importing..."
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Download Sample Helper */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-800 block">
              Standard General Ledger Template
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              Required columns: <code className="text-indigo-600 font-mono">gl_code</code>,{" "}
              <code className="text-indigo-600 font-mono">gl_name</code>,{" "}
              <code className="text-indigo-600 font-mono">structure</code>,{" "}
              <code className="text-indigo-600 font-mono">grouping</code>
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadSample}
            className="h-8.5 gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-white hover:text-indigo-600 text-xs shrink-0 shadow-2xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample CSV</span>
          </Button>
        </div>

        {/* FormField for Spreadsheet Upload */}
        <FormField
          label="Spreadsheet File"
          required
          error={fileError}
          helperText="Upload official Excel spreadsheet (.xlsx, .xls) or comma-separated CSV (up to 15MB)"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />

          {selectedFile ? (
            /* Selected File Card */
            <div className="flex items-center justify-between p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-2xl shadow-2xs transition-all">
              <div className="flex items-center gap-3 overflow-hidden mr-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Ready for import
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-white"
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => {
                    setSelectedFile(null);
                    setFileError("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 p-0 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Dropzone Area */
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed transition-all duration-200 text-center select-none cursor-pointer",
                isDragging
                  ? "border-indigo-500 bg-indigo-50/60 scale-[0.99]"
                  : "border-slate-200 bg-slate-50/40 hover:bg-indigo-50/20 hover:border-indigo-300",
                fileError && "border-red-400 bg-red-50/20 hover:border-red-400",
                isUploading && "opacity-70 pointer-events-none"
              )}
            >
              <div className="w-11 h-11 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-xs border border-slate-100">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  Click to select or drag & drop spreadsheet
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Supports Microsoft Excel (.xlsx, .xls) and CSV
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                Max 15MB • Required: gl_code, gl_name, structure, grouping
              </span>
            </div>
          )}
        </FormField>
      </div>
    </FormModal>
  );
};

