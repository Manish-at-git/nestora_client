import React, { useState } from "react";
import { toast } from "sonner";
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
import {
  createPropertyStructure,
  PropertyStructureEditor,
  type PropertyStructure,
} from "./PropertyStructureEditor";

const EMPTY_PROPERTY_STRUCTURE: PropertyStructure = { blocks: [] };

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
  const [propertyStructure, setPropertyStructure] = useState<PropertyStructure>(
    EMPTY_PROPERTY_STRUCTURE
  );
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
    setCsvFile(null);
    setCsvPreviewUrl("");
    setContractFile(null);
    setContractPreviewUrl("");
    setPropertyStructure(EMPTY_PROPERTY_STRUCTURE);
    setIsAnalyzingWorkbook(false);
    setErrors({});
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

    if (!file) {
      setPropertyStructure(EMPTY_PROPERTY_STRUCTURE);
      setContractFile(null);
      setContractPreviewUrl("");
      setIsAnalyzingWorkbook(false);
      return;
    }
    try {
      setIsAnalyzingWorkbook(true);
      const workbook = new FormData();
      workbook.append("csv_file", file);
      const response = await apiClient.post("/admin/associations/onboard/preview", workbook, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const metrics = unwrapApiData(response.data as { data: { blocks: Array<{ name: string; floors: Array<{ name: string; unit_count: number }>; unit_count: number }> } });
      const selectedEntity = entities.find((entity) => entity.id === entityId);
      const isCondominium = selectedEntity?.entity_type_name?.trim().toLowerCase() === "condominium";
      setPropertyStructure({ blocks: metrics.blocks.map((block, blockIndex) => isCondominium
        ? { id: "block-" + blockIndex, name: block.name, floors: block.floors.map((floor, floorIndex) => ({ id: "floor-" + blockIndex + "-" + floorIndex, name: floor.name, unit_count: String(floor.unit_count) })) }
        : { id: "block-" + blockIndex, name: block.name, unit_count: String(block.unit_count) }) });
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
    const selectedEntity = entities.find((entity) => entity.id === entityId);
    const isCondominium = selectedEntity?.entity_type_name?.trim().toLowerCase() === "condominium";
    const invalidStructure = !propertyStructure.blocks.length || propertyStructure.blocks.some((block) =>
      !block.name.trim() || (isCondominium
        ? !block.floors?.length || block.floors.some((floor) => !floor.name.trim() || !Number.isInteger(Number(floor.unit_count)) || Number(floor.unit_count) < 1)
        : !Number.isInteger(Number(block.unit_count)) || Number(block.unit_count) < 1)
    );
    if (invalidStructure) {
      setErrors({ propertyStructure: "Enter a block name and a positive unit count for every level" });
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
      formData.append("property_structure", JSON.stringify({
        blocks: propertyStructure.blocks.map((block) => ({
          name: block.name.trim(),
          ...(block.floors
            ? { floors: block.floors.map((floor) => ({ name: floor.name.trim(), unit_count: Number(floor.unit_count) })) }
            : { unit_count: Number(block.unit_count) }),
        })),
      }));
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
    setPropertyStructure(EMPTY_PROPERTY_STRUCTURE);
    setCsvFile(null);
    setCsvPreviewUrl("");
    setContractFile(null);
    setContractPreviewUrl("");
    setErrors({});
    setIsAnalyzingWorkbook(false);
    onClose();
  };

  const selectedEntity = entities.find((entity) => entity.id === entityId);
  const isCondominium = selectedEntity?.entity_type_name?.trim().toLowerCase() === "condominium";
  const calculatedTotalUnits = propertyStructure.blocks.reduce(
    (total, block) => total + (isCondominium
      ? (block.floors || []).reduce((floorTotal, floor) => floorTotal + (Number(floor.unit_count) || 0), 0)
      : Number(block.unit_count) || 0),
    0
  );

  const availableEntities = entities.filter((entity) => !entity.is_onboarded);
  const entityOptions = [
    {
      value: "",
      label: availableEntities.length
        ? "-- Select Organization Entity --"
        : "-- No un-onboarded entities available --",
    },
    ...availableEntities.map((ent) => ({
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
            disabled={isOnboarding || isLoadingEntities || availableEntities.length === 0}
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
                if (!url) {
                  void handleCsvChange(null, "");
                  return;
                }
                setCsvPreviewUrl(url);
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
              <p className="text-xs text-slate-500">Reading the property structure from this workbook...</p>
            )}
          </FormField>
        </div>
        <PropertyStructureEditor
          value={propertyStructure}
          isCondominium={isCondominium}
          error={errors.propertyStructure}
        />

        {/* Calculated total */}

        {calculatedTotalUnits > 0 && (
          <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-900 px-4 py-3 rounded-xl flex items-center justify-between transition-all animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Calculator size={16} className="text-indigo-600" />
              <span className="font-semibold text-xs text-indigo-900">
                Calculated Total {isCondominium ? "Units" : "Homes"}
              </span>
            </div>
            <span className="text-sm font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-100 shadow-2xs">
              {calculatedTotalUnits} {isCondominium ? "Units" : "Homes"}
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
