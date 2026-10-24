import React, { useEffect, useState } from "react";
import { Download, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import { FileUploadZone } from "./FileUploadZone";
import { FormField } from "./FormField";
import { FormModal } from "./FormModal";

interface ImportResult {
  imported_items?: number | null;
}

interface FinancialReportImportModalProps {
  isOpen: boolean;
  reportName: string;
  initialPeriod: string;
  templateEndpoint: string;
  templateFilename: string;
  columnsDescription: string;
  isSubmitting: boolean;
  onImport: (input: { fiscalPeriod: string; file: File }) => Promise<ImportResult>;
  onClose: () => void;
  onImported: (period: string) => void;
}

const defaultPeriod = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return {
    start: `${startYear}-04-01`,
    end: `${startYear + 1}-03-31`,
  };
};

const parsePeriodDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
};

export const FinancialReportImportModal: React.FC<
  FinancialReportImportModalProps
> = ({
  isOpen,
  reportName,
  initialPeriod,
  templateEndpoint,
  templateFilename,
  columnsDescription,
  isSubmitting,
  onImport,
  onClose,
  onImported,
}) => {
  const [periodStart, setPeriodStart] = useState(defaultPeriod().start);
  const [periodEnd, setPeriodEnd] = useState(defaultPeriod().end);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadZoneKey, setUploadZoneKey] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const [savedStart, savedEnd] = initialPeriod.split(" - ");
    const fallback = defaultPeriod();
    setPeriodStart(parsePeriodDate(savedStart) || fallback.start);
    setPeriodEnd(parsePeriodDate(savedEnd) || fallback.end);
    setFile(null);
    setError("");
    setUploadZoneKey((current) => current + 1);
  }, [initialPeriod, isOpen]);

  const fiscalPeriod = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;

  const downloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const response = await apiClient.get(templateEndpoint, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = templateFilename;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Unable to download the ${reportName} template`);
    } finally {
      setIsDownloading(false);
    }
  };

  const selectFile = (selected: File) => {
    if (!selected.name.toLowerCase().endsWith(".xlsx")) {
      throw new Error(
        `"${selected.name}" is not supported. Select an Excel workbook in .xlsx format.`,
      );
    }
    setFile(selected);
    setError("");
  };

  const submit = async () => {
    if (!periodStart || !periodEnd || periodStart > periodEnd) {
      setError("Choose a valid fiscal-period start and end date.");
      return;
    }
    if (!file) {
      setError(`Choose a completed ${reportName} workbook.`);
      return;
    }
    try {
      const result = await onImport({ fiscalPeriod, file });
      toast.success(
        `${reportName} imported with ${result.imported_items ?? 0} rows`,
      );
      onImported(fiscalPeriod);
      onClose();
    } catch (requestError: unknown) {
      const detail = requestError as { data?: unknown; message?: string };
      const message = formatApiErrorDetail(
        detail.data || detail.message || `Unable to import the ${reportName}`,
      );
      setError(message);
      toast.error(message);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import ${reportName}`}
      description="Upload one fiscal-period report for the selected association"
      icon={<UploadCloud className="h-5 w-5 text-indigo-600" />}
      size="lg"
      isSubmitting={isSubmitting}
      submitText={`Import ${reportName}`}
      loadingText="Validating workbook..."
      onSubmit={submit}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Use the validated template
            </p>
            <p className="mt-1 text-xs text-slate-500">{columnsDescription}</p>
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

        <FormField label="Fiscal period" required>
          <div className="flex items-center gap-2">
            <DatePicker
              value={periodStart}
              onChange={(value) => setPeriodStart(value || "")}
              placeholder="Start date"
              displayFormat="MMM d, yyyy"
            />
            <span className="text-xs text-slate-500">to</span>
            <DatePicker
              value={periodEnd}
              onChange={(value) => setPeriodEnd(value || "")}
              placeholder="End date"
              displayFormat="MMM d, yyyy"
            />
          </div>
        </FormField>

        <FormField
          label="Excel workbook"
          required
          error={error}
          helperText="Only .xlsx files up to 5 MB are accepted"
        >
          <FileUploadZone
            key={uploadZoneKey}
            value=""
            onChange={() => setFile(null)}
            onFileRead={selectFile}
            onError={setError}
            localOnly
            accept=".xlsx"
            maxSizeMB={5}
            label={`Choose ${reportName} workbook`}
            helperText="Drag and drop the completed template, or click to browse"
            error={Boolean(error)}
          />
        </FormField>
      </div>
    </FormModal>
  );
};
