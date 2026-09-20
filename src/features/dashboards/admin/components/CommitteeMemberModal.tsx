import React, { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { DatePicker, FormField, FormModal } from "@/components/common";
import { Select } from "@/components/ui/select";
import apiClient from "@/services/api/apiClient";
import {
  AdminAssociation,
  CommitteeMemberItem,
  CommitteeOption,
  HomeownerOption,
} from "../types";

export interface CommitteeMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentAssociationId?: string | number;
  adminAssociations: AdminAssociation[];
  editingMember?: CommitteeMemberItem | null;
}

export const CommitteeMemberModal: React.FC<CommitteeMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentAssociationId,
  adminAssociations,
  editingMember,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [committees, setCommittees] = useState<CommitteeOption[]>([]);
  const [homeowners, setHomeowners] = useState<HomeownerOption[]>([]);
  const [formData, setFormData] = useState({
    association_id: "",
    committee_id: "",
    user_id: "",
    start_date: "",
    end_date: "",
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
  const committeeOptions = committees.map((committee) => ({
    value: String(committee.id),
    label: committee.name,
  }));
  const homeownerOptions = homeowners.map((homeowner) => ({
    value: String(homeowner.user_id || homeowner.account_id),
    label: `${homeowner.name} (${homeowner.email})`,
  }));

  const selectedCommittee = useMemo(
    () =>
      committees.find(
        (committee) => String(committee.id) === formData.committee_id,
      ),
    [committees, formData.committee_id],
  );

  useEffect(() => {
    if (!isOpen) return;

    setCommittees([]);
    setHomeowners([]);
    setFormData({
      association_id: editingMember?.association_id
        ? String(editingMember.association_id)
        : String(currentAssociationId || ""),
      committee_id: String(editingMember?.committee_id || ""),
      user_id: String(editingMember?.user_id || ""),
      start_date: editingMember?.role_start_date?.split("T")[0] || "",
      end_date: editingMember?.role_end_date?.split("T")[0] || "",
    });
  }, [currentAssociationId, editingMember, isOpen]);

  useEffect(() => {
    const associationId = formData.association_id;
    if (!isOpen || !associationId || associationId === "ALL" || editingMember) {
      return;
    }

    const loadAssociationOptions = async () => {
      try {
        const [committeesResponse, homeownersResponse] = await Promise.all([
          apiClient.get(`/admin/committees?assoc_id=${associationId}`),
          apiClient.get(`/admin/associations/${associationId}/homeowners`),
        ]);
        const today = new Date().toISOString().split("T")[0];
        const committeeList = Array.isArray(committeesResponse.data)
          ? committeesResponse.data
          : committeesResponse.data?.data || [];
        const homeownerList = Array.isArray(homeownersResponse.data)
          ? homeownersResponse.data
          : homeownersResponse.data?.data || [];

        setCommittees(
          committeeList.filter(
            (committee: CommitteeOption) =>
              !committee.end_date || committee.end_date >= today,
          ),
        );
        setHomeowners(homeownerList);
      } catch (error) {
        console.error("Failed to load committee assignment options:", error);
        setCommittees([]);
        setHomeowners([]);
        toast.error("Failed to load association members and committees.");
      }
    };

    loadAssociationOptions();
  }, [editingMember, formData.association_id, isOpen]);

  const handleSubmit = async () => {
    if (!editingMember && (!formData.committee_id || !formData.user_id)) {
      toast.error("Please select a committee and homeowner.");
      return;
    }
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      toast.error("Role end date cannot be before the start date.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingMember) {
        await apiClient.put(
          `/admin/committee-members/${editingMember.committee_id}/${editingMember.user_id}`,
          {
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
          },
        );
        toast.success("Committee member dates updated!");
      } else {
        await apiClient.post("/admin/committee-members", {
          committee_id: formData.committee_id,
          user_id: formData.user_id,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
        });
        toast.success("Committee member assigned successfully!");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving committee member:", error);
      toast.error(
        error.response?.data?.detail || "Failed to save committee member",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMember ? "Edit Committee Member" : "Add Committee Member"}
      description={
        editingMember
          ? "Update this member's committee term dates."
          : "Assign an eligible homeowner to an active committee."
      }
      size="lg"
      isSubmitting={isSubmitting}
      submitText={editingMember ? "Update Member" : "Assign Member"}
      loadingText="Saving..."
      submitDisabled={
        !editingMember && (!formData.committee_id || !formData.user_id)
      }
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {editingMember ? (
          <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p><span className="font-semibold">Member:</span> {editingMember.name}</p>
            <p><span className="font-semibold">Committee:</span> {editingMember.committee_name}</p>
          </div>
        ) : (
          <>
            <FormField label="Association" required>
              <Select
                value={formData.association_id}
                onValueChange={(associationId) =>
                  setFormData((current) => ({
                    ...current,
                    association_id: associationId,
                    committee_id: "",
                    user_id: "",
                  }))
                }
                options={associationOptions}
                placeholder="Select association"
                disabled={isAssociationLocked}
              />
            </FormField>

            <FormField label="Committee" required>
              <Select
                value={formData.committee_id}
                onValueChange={(committeeId) =>
                  setFormData((current) => ({ ...current, committee_id: committeeId }))
                }
                options={committeeOptions}
                placeholder="Select committee"
                disabled={!formData.association_id || committeeOptions.length === 0}
              />
            </FormField>

            {selectedCommittee && (
              <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <p>
                  <span className="font-semibold">Committee timeline:</span>{" "}
                  {selectedCommittee.start_date || "No start limit"} to{" "}
                  {selectedCommittee.end_date || "No end limit"}
                </p>
              </div>
            )}

            <FormField label="Assign Homeowner" required>
              <Select
                value={formData.user_id}
                onValueChange={(userId) =>
                  setFormData((current) => ({ ...current, user_id: userId }))
                }
                options={homeownerOptions}
                placeholder="Select homeowner"
                disabled={!formData.association_id || homeownerOptions.length === 0}
              />
            </FormField>
          </>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Role Start Date">
            <DatePicker
              value={formData.start_date}
              onChange={(value) =>
                setFormData((current) => ({ ...current, start_date: String(value || "") }))
              }
              placeholder="Select start date"
            />
          </FormField>
          <FormField label="Role End Date">
            <DatePicker
              value={formData.end_date}
              onChange={(value) =>
                setFormData((current) => ({ ...current, end_date: String(value || "") }))
              }
              minDate={formData.start_date || undefined}
              placeholder="Select end date"
            />
          </FormField>
        </div>
      </div>
    </FormModal>
  );
};

export default CommitteeMemberModal;
