import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DatePicker, FormField, FormModal } from "@/components/common";
import { Select } from "@/components/ui/select";
import apiClient from "@/services/api/apiClient";
import { AdminAssociation, HomeownerOption } from "../types";

export interface BoardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAssociationId?: string | number;
  adminAssociations: AdminAssociation[];
}

export const BoardMemberModal: React.FC<BoardMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentAssociationId,
  adminAssociations,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHomeowners, setIsLoadingHomeowners] = useState(false);
  const [homeowners, setHomeowners] = useState<HomeownerOption[]>([]);
  const [formData, setFormData] = useState({
    association_id: currentAssociationId ? String(currentAssociationId) : "",
    account_id: "",
    term_start_date: "",
    term_end_date: "",
  });

  const isAssociationLocked = Boolean(
    currentAssociationId && currentAssociationId !== "ALL",
  );
  const associationOptions = adminAssociations
    .filter((association) => String(association.id) !== "ALL")
    .map((association) => ({
      value: String(association.id),
      label: association.name,
    }));
  const homeownerOptions = homeowners.map((homeowner) => ({
    value: String(homeowner.account_id || homeowner.user_id),
    label: `${homeowner.name} (${homeowner.email})`,
  }));

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      association_id: currentAssociationId ? String(currentAssociationId) : "",
      account_id: "",
      term_start_date: "",
      term_end_date: "",
    });
    setHomeowners([]);
  }, [isOpen, currentAssociationId]);

  useEffect(() => {
    const associationId = formData.association_id;
    if (!isOpen || !associationId || associationId === "ALL") return;

    const loadHomeowners = async () => {
      try {
        setIsLoadingHomeowners(true);
        const response = await apiClient.get(
          `/admin/associations/${associationId}/homeowners`,
        );
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setHomeowners(list);
      } catch (error) {
        console.error("Failed to load homeowners:", error);
        setHomeowners([]);
        toast.error("Failed to fetch homeowners");
      } finally {
        setIsLoadingHomeowners(false);
      }
    };

    loadHomeowners();
  }, [formData.association_id, isOpen]);

  const handleSubmit = async () => {
    if (!formData.association_id || !formData.account_id) {
      toast.error("Please select an association and homeowner.");
      return;
    }
    if (
      formData.term_start_date &&
      formData.term_end_date &&
      new Date(formData.term_end_date) < new Date(formData.term_start_date)
    ) {
      toast.error("Term end date cannot be before the start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post("/admin/board-members", formData);
      toast.success("Board member nominated successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error nominating board member:", error);
      toast.error(
        error.response?.data?.detail || "Failed to nominate board member",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Board Member"
      description="Nominate an eligible homeowner for a board term."
      size="lg"
      isSubmitting={isSubmitting}
      submitText="Nominate Board Member"
      loadingText="Nominating..."
      submitDisabled={!formData.account_id}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <FormField label="Association" required>
          <Select
            value={formData.association_id}
            onValueChange={(associationId) =>
              setFormData((current) => ({
                ...current,
                association_id: associationId,
                account_id: "",
              }))
            }
            options={associationOptions}
            placeholder="Select association"
            disabled={isAssociationLocked}
          />
        </FormField>

        <FormField
          label="Select Homeowner"
          required
          helperText={
            formData.association_id &&
            !isLoadingHomeowners &&
            homeowners.length === 0
              ? "No homeowners are available for this association."
              : undefined
          }
        >
          <Select
            value={formData.account_id}
            onValueChange={(accountId) =>
              setFormData((current) => ({ ...current, account_id: accountId }))
            }
            options={homeownerOptions}
            placeholder={
              isLoadingHomeowners ? "Loading homeowners..." : "Select homeowner"
            }
            disabled={isLoadingHomeowners || homeownerOptions.length === 0}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Term Start Date" required>
            <DatePicker
              value={formData.term_start_date}
              onChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  term_start_date: String(value || ""),
                }))
              }
              placeholder="Select start date"
            />
          </FormField>
          <FormField label="Term End Date" required>
            <DatePicker
              value={formData.term_end_date}
              onChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  term_end_date: String(value || ""),
                }))
              }
              minDate={formData.term_start_date || undefined}
              placeholder="Select end date"
            />
          </FormField>
        </div>
      </div>
    </FormModal>
  );
};

export default BoardMemberModal;
