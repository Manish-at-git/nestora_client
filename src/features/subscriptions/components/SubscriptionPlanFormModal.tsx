import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { CreditCard, Pencil } from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { FormField } from "@/components/common/FormField";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { COUNTRIES, getCurrencySymbol } from "@/utils/currency";
import { PlanFeaturesSelector } from "./PlanFeaturesSelector";
import {
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useSetSubscriptionPlanFeaturesMutation,
} from "../api/subscriptionsApi";
import type { SubscriptionPlan, SubscriptionPlanCreatePayload } from "../types";
import { formatApiErrorDetail } from "@/services/api/apiClient";

export interface SubscriptionPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: SubscriptionPlan | null;
  onSuccess?: () => void;
}

export const SubscriptionPlanFormModal: React.FC<SubscriptionPlanFormModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
  onSuccess,
}) => {
  const isEditMode = Boolean(planToEdit);

  const [createPlan, { isLoading: isCreating }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionPlanMutation();
  const [setFeatures, { isLoading: isSettingFeatures }] = useSetSubscriptionPlanFeaturesMutation();
  const isSaving = isCreating || isUpdating || isSettingFeatures;

  const [formData, setFormData] = useState<SubscriptionPlanCreatePayload>({
    name: "",
    code: "",
    country: "",
    description: "",
    monthly_price: 0,
    yearly_price: 0,
    trial_days: 0,
    is_active: true,
    feature_ids: [],
  });

  const [errors, setErrors] = useState<{
    name?: string;
    country?: string;
    monthly_price?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      if (planToEdit) {
        setFormData({
          name: planToEdit.name || "",
          code: planToEdit.code || "",
          country: planToEdit.country || "",
          description: planToEdit.description || "",
          monthly_price:
            planToEdit.monthly_price !== null && planToEdit.monthly_price !== undefined
              ? Number(planToEdit.monthly_price)
              : 0,
          yearly_price:
            planToEdit.yearly_price !== null && planToEdit.yearly_price !== undefined
              ? Number(planToEdit.yearly_price)
              : 0,
          trial_days: planToEdit.trial_days || 0,
          is_active: Boolean(planToEdit.is_active),
          feature_ids: planToEdit.features || [],
        });
      } else {
        setFormData({
          name: "",
          code: "",
          country: "",
          description: "",
          monthly_price: 0,
          yearly_price: 0,
          trial_days: 0,
          is_active: true,
          feature_ids: [],
        });
      }
      setErrors({});
    }
  }, [planToEdit, isOpen]);

  const currencySymbol = getCurrencySymbol(formData.country);

  const validate = () => {
    if (!formData.name.trim()) {
      setErrors({ name: "Plan name is required" });
      return false;
    }
    if (!formData.country) {
      setErrors({ country: "Please select a country / region" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let targetPlanId = planToEdit?.id;

      if (isEditMode && targetPlanId) {
        await updatePlan({
          id: targetPlanId,
          data: {
            name: formData.name.trim(),
            code: formData.code?.trim().toUpperCase() || null,
            country: formData.country,
            description: formData.description?.trim() || null,
            monthly_price: formData.monthly_price ? Number(formData.monthly_price) : 0,
            yearly_price: formData.yearly_price ? Number(formData.yearly_price) : 0,
            trial_days: Number(formData.trial_days) || 0,
            is_active: formData.is_active,
          },
        }).unwrap();
      } else {
        const createRes = await createPlan({
          name: formData.name.trim(),
          code: formData.code?.trim().toUpperCase() || null,
          country: formData.country,
          description: formData.description?.trim() || null,
          monthly_price: formData.monthly_price ? Number(formData.monthly_price) : 0,
          yearly_price: formData.yearly_price ? Number(formData.yearly_price) : 0,
          trial_days: Number(formData.trial_days) || 0,
          is_active: formData.is_active,
        }).unwrap();
        targetPlanId = createRes.id;
      }

      if (targetPlanId) {
        await setFeatures({
          plan_id: targetPlanId,
          feature_ids: formData.feature_ids || [],
        }).unwrap();
      }

      toast.success(
        `Subscription plan "${formData.name}" ${isEditMode ? "updated" : "created"} successfully.`
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        formatApiErrorDetail(err?.data || err?.message || "Failed to save subscription plan.")
      );
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Subscription Plan" : "Create Subscription Plan"}
      description="Configure pricing, billing intervals, trial periods, and feature quotas."
      icon={isEditMode ? <Pencil size={20} /> : <CreditCard size={20} />}
      size="2xl"
      onSubmit={handleSubmit}
      isSubmitting={isSaving}
      submitText={isEditMode ? "Save Changes" : "Create Plan"}
      loadingText={isEditMode ? "Saving Changes..." : "Creating Plan..."}
    >
      <div className="space-y-4">
        {/* Plan Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField
              label="Plan Name"
              required
              error={errors.name}
              helperText="e.g. Starter, Growth, Enterprise"
            >
              <Input
                type="text"
                placeholder="Enter plan name..."
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                disabled={isSaving}
              />
            </FormField>
          </div>

          <div>
            <FormField
              label="Plan Code"
              helperText="Optional identifier"
            >
              <Input
                type="text"
                placeholder="e.g. PRO"
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                disabled={isSaving}
                className="uppercase font-mono"
              />
            </FormField>
          </div>
        </div>

        {/* Country & Trial Days */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Country / Region"
            required
            error={errors.country}
            helperText="Determines currency and region pricing"
          >
            <Select
              value={formData.country}
              placeholder="Select country / region..."
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, country: e.target.value }));
                if (errors.country) setErrors((prev) => ({ ...prev, country: undefined }));
              }}
              disabled={isSaving}
              error={Boolean(errors.country)}
              options={COUNTRIES?.map((c) => ({ value: c.name, label: `${c.flag} ${c.name} (${getCurrencySymbol(c.name)})` })) || []}
            />
          </FormField>

          <FormField
            label="Trial Days"
            helperText="Days before first billing charge"
          >
            <NumberInput
              min={0}
              allowDecimals={false}
              placeholder="0"
              value={formData.trial_days}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  trial_days: val ?? 0,
                }))
              }
              disabled={isSaving}
            />
          </FormField>
        </div>

        {/* Pricing: Monthly & Yearly */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/75 p-4 rounded-xl border border-slate-200/60">
          <FormField
            label={`Monthly Price (${currencySymbol})`}
            helperText="Recurring per month fee"
            error={errors.monthly_price}
          >
            <NumberInput
              min={0}
              allowDecimals={true}
              decimalScale={2}
              placeholder="0.00"
              leftIcon={<span className="text-sm font-semibold text-slate-500">{currencySymbol}</span>}
              value={formData.monthly_price}
              onValueChange={(val) => {
                setFormData((prev) => ({
                  ...prev,
                  monthly_price: val ?? 0,
                }));
                if (errors.monthly_price) setErrors((prev) => ({ ...prev, monthly_price: undefined }));
              }}
              disabled={isSaving}
            />
          </FormField>

          <FormField
            label={`Yearly Price (${currencySymbol})`}
            helperText="Annual subscription fee"
          >
            <NumberInput
              min={0}
              allowDecimals={true}
              decimalScale={2}
              placeholder="0.00"
              leftIcon={<span className="text-sm font-semibold text-slate-500">{currencySymbol}</span>}
              value={formData.yearly_price}
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  yearly_price: val ?? 0,
                }))
              }
              disabled={isSaving}
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField
          label="Plan Description"
          helperText="Key highlights or target association size"
        >
          <Textarea
            rows={2}
            placeholder="e.g. Designed for medium associations up to 100 units with community amenities"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            disabled={isSaving}
            className="resize-none"
          />
        </FormField>

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
          <div>
            <p className="text-xs font-semibold text-slate-800">
              Plan Availability
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Inactive plans will be hidden from new association on-boarding
            </p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                is_active: Boolean(checked),
              }))
            }
            disabled={isSaving}
          />
        </div>

        {/* Feature Inclusion Checklist */}
        <div className="pt-2">
          <label className="block text-sm font-semibold tracking-wider text-slate-600 mb-2">
            Features Included in this Plan
          </label>
          <PlanFeaturesSelector
            selectedFeatureIds={formData.feature_ids || []}
            onChange={(ids) =>
              setFormData((prev) => ({ ...prev, feature_ids: ids }))
            }
            disabled={isSaving}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default SubscriptionPlanFormModal;
