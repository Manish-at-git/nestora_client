import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Building, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  FormModal,
  FormField,
  FileUploadZone,
} from "@/components/common";
import { uploadMediaAsset, uploadDocumentAsset } from "@/lib/cloudUploader";
import {
  useCreateBoardTaskMutation,
  useLazyGetAssociationBoardMembersQuery,
  useGetAdminAssociationsQuery,
} from "../api/boardTasksApi";
import type { BoardTaskFormData } from "../types";

export interface BoardTaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  adminAssociations?: Array<{ id: string | number; name: string }>;
  defaultAssociationId?: string;
  isBoardMember?: boolean;
}

export const BoardTaskFormModal: React.FC<BoardTaskFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminAssociations: passedAdminAssociations = [],
  defaultAssociationId,
  isBoardMember = false,
}) => {
  const [formData, setFormData] = useState<BoardTaskFormData>({
    association_id: "",
    title: "",
    description: "",
    supervised_by: "",
    image_url: "",
  });

  // Fallback query to load associations for Admin / Super Admin if not passed via props
  const { data: fetchedAssocs = [], isLoading: isFetchingAssocs } =
    useGetAdminAssociationsQuery(undefined, {
      skip: isBoardMember || (passedAdminAssociations && passedAdminAssociations.length > 0),
    });

  const effectiveAssociations =
    passedAdminAssociations.length > 0 ? passedAdminAssociations : fetchedAssocs;

  // Filter out "ALL" from associations
  const validAssociations = effectiveAssociations.filter(
    (a) => String(a.id) !== "ALL" && a.name !== "All Associations"
  );

  const [createBoardTask, { isLoading: isSubmitting }] =
    useCreateBoardTaskMutation();
  const [fetchBoardMembers, { data: boardMembers = [], isLoading: isFetchingMembers }] =
    useLazyGetAssociationBoardMembersQuery();

  // Initialize association ID and fetch board members on modal open
  useEffect(() => {
    if (isOpen) {
      let initialAssocId = "";
      if (isBoardMember) {
        initialAssocId = "me";
      } else if (defaultAssociationId && defaultAssociationId !== "ALL") {
        initialAssocId = String(defaultAssociationId);
      } else if (validAssociations.length > 0) {
        initialAssocId = String(validAssociations[0].id);
      }

      setFormData({
        association_id: initialAssocId,
        title: "",
        description: "",
        supervised_by: "",
        image_url: "",
      });

      if (initialAssocId) {
        fetchBoardMembers(initialAssocId);
      }
    }
  }, [
    isOpen,
    defaultAssociationId,
    validAssociations.length,
    isBoardMember,
    fetchBoardMembers,
  ]);

  // Handle association selection change
  const handleAssociationChange = (assocId: string) => {
    setFormData((prev) => ({
      ...prev,
      association_id: assocId,
      supervised_by: "",
    }));
    if (assocId) {
      fetchBoardMembers(assocId);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    toast.info("Uploading attachment...");
    const uploader = file.type.startsWith("image/")
      ? uploadMediaAsset
      : uploadDocumentAsset;
    const res = await uploader(file);
    if (res && res.ok && res.url) {
      toast.success("Attachment uploaded successfully");
      return res.url;
    }
    toast.error("Failed to upload attachment");
    throw new Error("Failed to upload attachment");
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!isBoardMember && !formData.association_id) {
      toast.error("Please select an association");
      return;
    }
    if (!formData.supervised_by) {
      toast.error("Please select a supervisor (Board Member)");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }
    if (formData.title.length > 100) {
      toast.error("Task title cannot exceed 100 characters");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a task description");
      return;
    }
    if (formData.description.length > 5000) {
      toast.error("Task description cannot exceed 5000 characters");
      return;
    }

    try {
      await createBoardTask({
        ...formData,
        association_id: formData.association_id || "me",
      }).unwrap();

      toast.success("Board Task created successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Failed to create board task");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Board Task"
      description="Assign and supervise common area initiatives with board members."
      icon={<ClipboardCheck size={18} className="text-slate-800" />}
      size="2xl"
      submitText="Create Task"
      loadingText="Creating…"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    >
      <div className="space-y-5">
        {/* Association Selector (shown for Admins & Super Admins) */}
        {!isBoardMember && (
          <FormField label="Association" required>
            <Select
              icon={<Building size={15} />}
              options={validAssociations}
              value={formData.association_id || ""}
              onChange={(e) => handleAssociationChange(e.target.value)}
              placeholder={
                isFetchingAssocs
                  ? "Loading associations..."
                  : validAssociations.length === 0
                  ? "No associations found"
                  : "-- Select Association --"
              }
              disabled={isFetchingAssocs}
              required
              size="md"
            />
          </FormField>
        )}

        {/* Supervisor Selection */}
        <FormField label="Supervised By (Board Member)" required>
          <Select
            icon={<User size={15} />}
            options={boardMembers.map((bm) => ({
              value: bm.account_id,
              label: `${bm.name} (${bm.email})`,
            }))}
            value={formData.supervised_by}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, supervised_by: e.target.value }))
            }
            placeholder={
              isFetchingMembers
                ? "Loading board members..."
                : !formData.association_id && !isBoardMember
                ? "Select an association first"
                : boardMembers.length === 0
                ? "No board members found in this association"
                : "-- Select Board Member --"
            }
            required
            disabled={isFetchingMembers || (!isBoardMember && !formData.association_id)}
            size="md"
          />
        </FormField>

        {/* Task Title */}
        <FormField
          label="Task Title"
          required
          charCount={{ current: formData.title.length, max: 100 }}
        >
          <Input
            type="text"
            placeholder="e.g. Clubhouse AC Unit Overhaul"
            value={formData.title}
            maxLength={100}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full rounded-xl border-slate-200 py-2.5 text-sm focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
            required
          />
        </FormField>

        {/* Description */}
        <FormField
          label="Description"
          required
          charCount={{ current: formData.description.length, max: 5000 }}
        >
          <Textarea
            placeholder="Provide comprehensive details, instructions, or scope of the task..."
            value={formData.description}
            maxLength={5000}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="min-h-[120px]"
            required
          />
        </FormField>

        {/* Attachment Upload */}
        <FormField label="Attachment (Optional)">
          <FileUploadZone
            value={formData.image_url}
            onChange={(url) =>
              setFormData((prev) => ({ ...prev, image_url: url }))
            }
            onUpload={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            label="Upload photo, quote, or specification document"
          />
        </FormField>
      </div>
    </FormModal>
  );
};

export default BoardTaskFormModal;
