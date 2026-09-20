import React, { useState, useEffect } from "react";
import { FileText, Building, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MonthPicker } from "@/components/ui/month-picker";
import { FormModal, FormField, FileUploadZone } from "@/components/common";
import { toast } from "sonner";
import { useCreateFinancialReportMutation } from "../api/financialsApi";
import { useGetAssociationsQuery } from "@/features/associations/api";

export interface PublishReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TYPE_OPTIONS = [
  { value: "Balance Sheet", label: "Balance Sheet" },
  { value: "Income Statement", label: "Income & Expense Statement" },
  { value: "Trial Balance", label: "Trial Balance" },
  { value: "Cash Flow", label: "Cash Flow Statement" },
  { value: "Audit Report", label: "Audited Financial Report" },
  { value: "Annual Budget", label: "Annual Operating Budget" },
];

export const PublishReportModal: React.FC<PublishReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [associationId, setAssociationId] = useState("");
  const [reportType, setReportType] = useState("");
  const [publishedMonth, setPublishedMonth] = useState("");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: associations = [], isLoading: isLoadingAssocs } = useGetAssociationsQuery();
  const [createReport, { isLoading: isPublishing }] = useCreateFinancialReportMutation();

  useEffect(() => {
    if (isOpen) {
      setAssociationId("");
      setReportType("");
      setPublishedMonth("");
      setTitle("");
      setFileUrl("");
      setErrors({});
    }
  }, [isOpen]);

  const handleReportTypeChange = (newType: string) => {
    setReportType(newType);
    if (errors.reportType) {
      setErrors((prev) => ({ ...prev, reportType: "" }));
    }
    if (newType && (!title || title.includes("Sheet") || title.includes("Statement") || title.includes("Report") || title.includes("Budget"))) {
      const selectedAssoc = associations.find((a) => a.id === associationId);
      const assocName = selectedAssoc?.name || "";
      const currentYear = publishedMonth ? publishedMonth.split("-")[0] : new Date().getFullYear();
      setTitle(`${assocName ? `${assocName} - ` : ""}${newType} (${currentYear})`);
    }
  };

  const validate = () => {
    if (!associationId) {
      setErrors({ associationId: "Please select an association" });
      return false;
    }
    if (!reportType) {
      setErrors({ reportType: "Please select a report type" });
      return false;
    }
    if (!publishedMonth.trim()) {
      setErrors({ publishedMonth: "Reporting period is required" });
      return false;
    }
    if (!title.trim()) {
      setErrors({ title: "Statement title is required" });
      return false;
    }
    if (!fileUrl.trim()) {
      setErrors({ fileUrl: "Please upload a verified financial statement document" });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      await createReport({
        association_id: associationId,
        report_type: reportType,
        published_month: publishedMonth.trim(),
        title: title.trim(),
        file_url: fileUrl.trim(),
      }).unwrap();

      toast.success("Financial statement published successfully!");
      onClose();
    } catch (err: any) {
      const errorMsg = err?.data?.message || err?.data || err?.message || "Failed to publish statement";
      toast.error(errorMsg);
    }
  };

  const associationOptions = associations.map((assoc) => ({
    value: assoc.id,
    label: `${assoc.name}${assoc.city ? ` (${assoc.city})` : ""}`,
  }));

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish Financial Statement"
      description="Upload and publish verified community financial statements, balance sheets, and audit reports"
      icon={<FileText className="w-5 h-5 text-indigo-600" />}
      size="xl"
      isSubmitting={isPublishing}
      submitText="Publish Statement"
      loadingText="Publishing..."
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {/* Association Selection */}
        <FormField
          label="Target Association"
          required
          error={errors.associationId}
        >
          <Select
            icon={<Building size={16} />}
            value={associationId}
            onChange={(e) => {
              setAssociationId(e.target.value);
              if (errors.associationId) {
                setErrors((prev) => ({ ...prev, associationId: "" }));
              }
            }}
            options={associationOptions}
            placeholder="Select an association..."
            disabled={isLoadingAssocs || isPublishing}
            error={Boolean(errors.associationId)}
          />
        </FormField>

        {/* Report Type & Reporting Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Report Type"
            required
            error={errors.reportType}
          >
            <Select
              icon={<Receipt size={16} />}
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
              options={REPORT_TYPE_OPTIONS}
              placeholder="Select report type..."
              disabled={isPublishing}
              error={Boolean(errors.reportType)}
            />
          </FormField>

          <FormField
            label="Reporting Period (Month/Year)"
            required
            error={errors.publishedMonth}
          >
            <MonthPicker
              value={publishedMonth}
              onChange={(val) => {
                setPublishedMonth(val);
                if (errors.publishedMonth) {
                  setErrors((prev) => ({ ...prev, publishedMonth: "" }));
                }
              }}
              placeholder="Select month & year..."
              disabled={isPublishing}
              error={Boolean(errors.publishedMonth)}
            />
          </FormField>
        </div>

        {/* Statement Title */}
        <FormField
          label="Statement Title"
          required
          error={errors.title}
          helperText="Descriptive label visible to board members and homeowners"
        >
          <Input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: "" }));
              }
            }}
            placeholder="e.g. FY 2026 Q2 Comprehensive Balance Sheet"
            disabled={isPublishing}
            error={Boolean(errors.title)}
          />
        </FormField>

        {/* Document PDF Upload */}
        <FormField
          label="Financial Statement Document"
          required
          error={errors.fileUrl}
          helperText="Upload official PDF statement, balance sheet, or audit report (up to 25MB)"
        >
          <FileUploadZone
            value={fileUrl}
            onChange={(url) => {
              setFileUrl(url);
              if (errors.fileUrl) {
                setErrors((prev) => ({ ...prev, fileUrl: "" }));
              }
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            label="Upload Statement (PDF / Spreadsheet)"
            helperText="Drag & drop your file here, or click to browse"
            maxSizeMB={25}
            disabled={isPublishing}
            error={Boolean(errors.fileUrl)}
          />
        </FormField>
      </div>
    </FormModal>
  );
};




