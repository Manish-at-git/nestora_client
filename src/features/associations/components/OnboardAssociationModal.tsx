import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/common/FormField";
import { FormModal } from "@/components/common/FormModal";
import { FileUploadZone } from "@/components/common/FileUploadZone";
import { useGetEntitiesQuery } from "@/features/entities/api/entitiesApi";
import { useOnboardAssociationMutation } from "../api/associationsApi";
import {
  Building,
  Download,
  Calculator,
} from "lucide-react";
import apiClient, { formatApiErrorDetail } from "@/services/api/apiClient";
import { unwrapApiData } from "@/services/api/response";

export interface OnboardAssociationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OnboardAssociationModal: React.FC<OnboardAssociationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: entities = [], isLoading: isLoadingEntities } = useGetEntitiesQuery(
    undefined,
    { skip: !isOpen }
  );
  const [onboardAssociation, { isLoading: isOnboarding }] = useOnboardAssociationMutation();

  const [entityId, setEntityId] = useState("");
  const [numBlocks, setNumBlocks] = useState("");
  const [floorsPerBlock, setFloorsPerBlock] = useState("");
  const [unitsPerFloor, setUnitsPerFloor] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewUrl, setCsvPreviewUrl] = useState("");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractPreviewUrl, setContractPreviewUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAnalyzingWorkbook, setIsAnalyzingWorkbook] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const res = await apiClient.get("/admin/associations/excel-template", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "onboarding_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Template downloaded successfully");
    } catch (err) {
      toast.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEntityChange = (val: string) => {
    setEntityId(val);
    setErrors((prev) => {
      if (!prev.entityId) return prev;
      const next = { ...prev };
      delete next.entityId;
      return next;
    });
  };

  const handleCsvChange = async (file: File | null, url: string) => {
    setCsvFile(file);
    setCsvPreviewUrl(url);
    setErrors((prev) => {
      if (!prev.csvFile) return prev;
      const next = { ...prev };
      delete next.csvFile;
      return next;
    });

    if (!file) return;
    try {
      setIsAnalyzingWorkbook(true);
      const workbook = new FormData();
      workbook.append("csv_file", file);
      const response = await apiClient.post("/admin/associations/onboard/preview", workbook, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const metrics = unwrapApiData(response.data as { data: {
        num_blocks: number;
        floors_per_block: number;
        units_per_floor: number;
      } });
      setNumBlocks(String(metrics.num_blocks || ""));
      setFloorsPerBlock(String(metrics.floors_per_block || ""));
      setUnitsPerFloor(String(metrics.units_per_floor || ""));
    } catch (err: any) {
      toast.error(formatApiErrorDetail(err?.response?.data || "Could not read Unit Details from this workbook."));
    } finally {
      setIsAnalyzingWorkbook(false);
    }
  };

  const validate = () => {
    // Sequential validation: check top-to-bottom and display only the FIRST error
    if (!entityId || !entityId.trim()) {
      setErrors({ entityId: "Please select an organization entity" });
      return false;
    }
    if (!csvFile) {
      setErrors({ csvFile: "Please upload the completed onboarding Excel file" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("entity_id", entityId);
      if (numBlocks) formData.append("num_blocks", numBlocks);
      if (floorsPerBlock) formData.append("floors_per_block", floorsPerBlock);
      if (unitsPerFloor) formData.append("units_per_floor", unitsPerFloor);
      if (csvFile) formData.append("csv_file", csvFile);
      if (contractFile) formData.append("contract_file", contractFile);

      await onboardAssociation(formData).unwrap();
      toast.success("Association and Homeowners onboarded successfully!");
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err?.data || err?.message || "Failed to onboard association.")
      );
    }
  };

  const handleClose = () => {
    setEntityId("");
    setNumBlocks("");
    setFloorsPerBlock("");
    setUnitsPerFloor("");
    setCsvFile(null);
    setCsvPreviewUrl("");
    setContractFile(null);
    setContractPreviewUrl("");
    setErrors({});
    setIsAnalyzingWorkbook(false);
    onClose();
  };

  const calculatedTotalUnits =
    numBlocks && floorsPerBlock && unitsPerFloor
      ? parseInt(numBlocks, 10) * parseInt(floorsPerBlock, 10) * parseInt(unitsPerFloor, 10)
      : null;

  const entityOptions = [
    { value: "", label: "-- Select Organization Entity --" },
    ...entities.map((ent) => ({
      value: ent.id,
      label: `${ent.name} (${ent.entity_type_name || "Entity"})`,
    })),
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Onboard Association"
      description="Upload details and homeowners to formalize the association."
      icon={
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <Building size={18} />
        </div>
      }
      size="xl"
      onSubmit={handleFormSubmit}
      submitText="Complete Onboarding"
      loadingText="Onboarding..."
      isSubmitting={isOnboarding}
      cancelText="Cancel"
      cancelVariant="outline"
      formProps={{ noValidate: true }}
    >
      <div className="space-y-4">
        {/* Select Entity (Lead) */}
        <FormField
          label="Select Entity (Lead)"
          required
          error={errors.entityId}
          helperText={!errors.entityId ? "Assign association to an existing organization entity" : undefined}
        >
          <Select
            value={entityId}
            onValueChange={handleEntityChange}
            onChange={(e) => {
              const val = typeof e === "string" ? e : e?.target?.value ?? "";
              handleEntityChange(val);
            }}
            options={entityOptions}
            placeholder="-- Select Organization Entity --"
            disabled={isOnboarding || isLoadingEntities}
            error={Boolean(errors.entityId)}
            size="sm"
          />
        </FormField>

        {/* Bulk Upload Excel (.xlsx) using FileUploadZone within FormField */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Bulk Upload Excel (.xlsx) <span className="text-red-500 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline cursor-pointer disabled:opacity-50"
            >
              <Download size={13} />
              <span>Download Template</span>
            </button>
          </div>

          <FormField
            label=""
            error={errors.csvFile}
          >
            <FileUploadZone
              value={csvPreviewUrl}
              onChange={(url) => {
                // FileUploadZone calls onChange after onUpload with the preview
                // URL. Keep the File object for FormData submission; clear it
                // only when the user removes the uploaded file.
                setCsvPreviewUrl(url);
                if (!url) setCsvFile(null);
                setErrors((prev) => {
                  if (!prev.csvFile) return prev;
                  const next = { ...prev };
                  delete next.csvFile;
                  return next;
                });
              }}
              onUpload={async (file) => {
                const preview = URL.createObjectURL(file);
                void handleCsvChange(file, preview);
                return preview;
              }}
              accept=".xlsx,.xls,.csv"
              label="Upload completed Excel sheet (.xlsx, .xls, .csv)"
              helperText="Drag & drop or click to upload completed onboarding template"
              disabled={isOnboarding}
              error={Boolean(errors.csvFile)}
            />
            {isAnalyzingWorkbook && (
              <p className="text-xs text-slate-500">Reading Unit Details to fill the building fields...</p>
            )}
          </FormField>
        </div>

        {/* 3-Column Grid: Number of Blocks, Floors per Block, Units per Floor */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <FormField label="Number of Blocks">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 2"
              value={numBlocks}
              onChange={(e) => setNumBlocks(e.target.value)}
              disabled={isOnboarding}
            />
          </FormField>
          <FormField label="Floors per Block">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 5"
              value={floorsPerBlock}
              onChange={(e) => setFloorsPerBlock(e.target.value)}
              disabled={isOnboarding}
            />
          </FormField>
          <FormField label="Units per Floor">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 4"
              value={unitsPerFloor}
              onChange={(e) => setUnitsPerFloor(e.target.value)}
              disabled={isOnboarding}
            />
          </FormField>
        </div>

        {/* Calculated Total Units Banner */}
        {calculatedTotalUnits !== null && !isNaN(calculatedTotalUnits) && (
          <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-900 px-4 py-3 rounded-xl flex items-center justify-between transition-all animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-indigo-600" />
              <span className="font-semibold text-xs text-indigo-900">
                Calculated Total Units
              </span>
            </div>
            <span className="text-sm font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-100 shadow-2xs">
              {calculatedTotalUnits} Units
            </span>
          </div>
        )}

        {/* Contract or Agreement (Optional) using FileUploadZone */}
        <div className="pt-1">
          <FormField label="Contract or Agreement (Optional)">
            <FileUploadZone
              value={contractPreviewUrl}
              onChange={(url) => {
                setContractPreviewUrl(url);
                if (!url) setContractFile(null);
              }}
              onUpload={async (file) => {
                setContractFile(file);
                const preview = URL.createObjectURL(file);
                setContractPreviewUrl(preview);
                return preview;
              }}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              label="Upload contract or agreement document"
              helperText="Drag & drop or click to upload PDF, DOCX, or Image"
              disabled={isOnboarding}
            />
          </FormField>
        </div>

      </div>
    </FormModal>
  );
};

export default OnboardAssociationModal;
