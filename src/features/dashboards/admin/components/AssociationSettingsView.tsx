import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";
import { Button } from "@/components/ui/button";
import { AdminAssociation, AssociationSettings, FineRule } from "../types";
import { DatesAndAccessCard } from "./DatesAndAccessCard";
import { AssessmentSetupCard } from "./AssessmentSetupCard";
import { FineSetupCard } from "./FineSetupCard";
import { AmenitiesSetupCard } from "./AmenitiesSetupCard";
import { BoardMembersSection } from "./BoardMembersSection";
import { CommitteeMembersSection } from "./CommitteeMembersSection";

export interface AssociationSettingsViewProps {
  association: AdminAssociation | null;
  adminAssociations: AdminAssociation[];
  onBack: () => void;
}

export const AssociationSettingsView: React.FC<AssociationSettingsViewProps> = ({
  association,
  adminAssociations,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AssociationSettings>({
    onboarding_date: "",
    end_date: "",
    assessment_rules: {
      frequency: "Monthly",
      default_amount: 0,
      due_day_of_month: 1,
    },
    fine_rules: [],
  });

  const currencySymbol =
    association?.country?.toLowerCase() === "india" || !association?.country
      ? "₹"
      : "$";

  useEffect(() => {
    if (association && association.id && String(association.id) !== "ALL") {
      fetchSettings();
    }
  }, [association?.id]);

  const fetchSettings = async () => {
    if (!association?.id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/admin/associations/${association.id}/settings`
      );
      const data = res.data?.data || res.data || {};
      setSettings({
        onboarding_date: data.onboarding_date || "",
        end_date: data.end_date || "",
        assessment_rules: data.assessment_rules || {
          frequency: "Monthly",
          default_amount: 0,
          due_day_of_month: 1,
        },
        fine_rules: data.fine_rules || [],
      });
    } catch (err) {
      console.error("Error fetching association settings:", err);
      toast.error("Failed to load association settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!association?.id) return;
    try {
      setSaving(true);
      await apiClient.put(`/admin/associations/${association.id}/settings`, {
        end_date: settings.end_date || null,
        assessment_rules: settings.assessment_rules,
        fine_rules: settings.fine_rules,
      });
      toast.success("Settings saved successfully.");
      fetchSettings();
    } catch (err) {
      console.error("Error saving association settings:", err);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFine = (fine: FineRule) => {
    setSettings((prev) => ({
      ...prev,
      fine_rules: [...prev.fine_rules, fine],
    }));
  };

  const handleRemoveFine = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      fine_rules: prev.fine_rules.filter((_, i) => i !== index),
    }));
  };

  if (!association || String(association.id) === "ALL") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
        <AlertCircle size={48} className="mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-slate-800">
          No Association Selected
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Please select a specific association to view and edit its settings.
        </p>
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="mt-4 rounded-xl"
        >
          Return to Associations List
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm">Loading association settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar matching Screenshot 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="rounded-xl text-slate-500 hover:text-slate-800"
            title="Back to All Associations"
          >
            <ArrowLeft size={22} />
          </Button>
          <div>
            <h2 className="text-2xl font-serif text-slate-800">
              {association.name} Settings
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage rules, configuration, and dates for this association.
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Grid: Dates & Access + Assessment Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DatesAndAccessCard
          onboardingDate={settings.onboarding_date}
          endDate={settings.end_date}
          onChangeEndDate={(date) =>
            setSettings((prev) => ({ ...prev, end_date: date }))
          }
        />

        <AssessmentSetupCard
          rules={settings.assessment_rules}
          currencySymbol={currencySymbol}
          onChange={(updated) =>
            setSettings((prev) => ({
              ...prev,
              assessment_rules: { ...prev.assessment_rules, ...updated },
            }))
          }
        />
      </div>

      {/* Fine Setup */}
      <FineSetupCard
        fineRules={settings.fine_rules}
        currencySymbol={currencySymbol}
        onAddFine={handleAddFine}
        onRemoveFine={handleRemoveFine}
      />

      {/* Amenities Setup */}
      <AmenitiesSetupCard
        associationId={association.id}
        currencySymbol={currencySymbol}
      />

      {/* Board Members */}
      <BoardMembersSection
        associationId={association.id}
        associationName={association.name}
        adminAssociations={adminAssociations}
      />

      {/* Committee Members */}
      <CommitteeMembersSection
        associationId={association.id}
        adminAssociations={adminAssociations}
      />
    </div>
  );
};

export default AssociationSettingsView;
