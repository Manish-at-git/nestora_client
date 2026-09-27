import React, { useMemo, useState } from "react";
import { Activity, LayoutTemplate, MailCheck } from "lucide-react";
import { AccessRestricted } from "@/components/common";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/constants/featureCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useGetEmailTemplatesQuery } from "../api";
import {
  EmailTemplateFormModal,
  EmailTemplatePreviewModal,
  EmailTemplateTable,
  EmailTemplateTestModal,
} from "../components";
import { EMAIL_TEMPLATE_EVENT_PRESETS } from "../constants";
import type { EmailTemplate } from "../types";

interface TemplateStatProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  accentClassName: string;
}

const TemplateStat: React.FC<TemplateStatProps> = ({
  icon,
  label,
  value,
  accentClassName,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className={
          "flex h-10 w-10 items-center justify-center rounded-xl " +
          accentClassName
        }
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

export const EmailTemplatesPage: React.FC = () => {
  const permission = usePermission(FEATURES.EMAIL_TEMPLATES.FEATURE_CODE);
  const canView = permission.canView || permission.isSuperAdmin;
  const canCreate = permission.canCreate || permission.isSuperAdmin;

  const [isFormOpen, setFormOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] =
    useState<EmailTemplate | null>(null);
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [templateToPreview, setTemplateToPreview] =
    useState<EmailTemplate | null>(null);
  const [templateToTest, setTemplateToTest] =
    useState<EmailTemplate | null>(null);

  usePageHeader({
    title: FEATURES.EMAIL_TEMPLATES.FEATURE_LABEL,
    description:
      "Create and manage reusable email content without connecting it to application events.",
  });

  const {
    data: templates = [],
    isLoading,
    refetch,
  } = useGetEmailTemplatesQuery(undefined, { skip: !canView });

  const stats = useMemo(() => {
    const presetKeys = new Set<string>(
      EMAIL_TEMPLATE_EVENT_PRESETS.map((preset) => preset.key),
    );
    return {
      active: templates.filter((template) => template.is_active).length,
      preset: templates.filter((template) =>
        presetKeys.has(template.event_type),
      ).length,
    };
  }, [templates]);

  const openCreate = (selectedPresetKey?: string) => {
    setTemplateToEdit(null);
    setPresetKey(selectedPresetKey || null);
    setFormOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setTemplateToEdit(template);
    setPresetKey(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setTemplateToEdit(null);
    setPresetKey(null);
  };

  if (!permission.isLoading && !canView) {
    return (
      <AccessRestricted
        moduleName={FEATURES.EMAIL_TEMPLATES.FEATURE_LABEL}
        showAction
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TemplateStat
          icon={<LayoutTemplate size={18} />}
          label="Total Templates"
          value={templates.length}
          accentClassName="bg-indigo-50 text-indigo-600"
        />
        <TemplateStat
          icon={<Activity size={18} />}
          label="Active Templates"
          value={stats.active}
          accentClassName="bg-emerald-50 text-emerald-600"
        />
        <TemplateStat
          icon={<MailCheck size={18} />}
          label="Preset Event Types"
          value={stats.preset}
          accentClassName="bg-amber-50 text-amber-600"
        />
      </div> */}

      {/* {canCreate ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Quick Start
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Start with a suggested event key. These records remain master
              data only until a future integration is approved.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TEMPLATE_EVENT_PRESETS.slice(0, 4).map((preset) => (
              <Button
                key={preset.key}
                type="button"
                variant="outline"
                onClick={() => openCreate(preset.key)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </section>
      ) : null} */}

      <EmailTemplateTable
        templates={templates}
        isLoading={isLoading || permission.isLoading}
        onAdd={() => openCreate()}
        onEdit={openEdit}
        onPreview={setTemplateToPreview}
        onTest={setTemplateToTest}
      />

      <EmailTemplateFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        templateToEdit={templateToEdit}
        presetKey={presetKey}
        onSuccess={() => refetch()}
      />

      <EmailTemplatePreviewModal
        isOpen={Boolean(templateToPreview)}
        onClose={() => setTemplateToPreview(null)}
        template={templateToPreview}
      />

      <EmailTemplateTestModal
        isOpen={Boolean(templateToTest)}
        onClose={() => setTemplateToTest(null)}
        template={templateToTest}
      />
    </div>
  );
};

export default EmailTemplatesPage;
