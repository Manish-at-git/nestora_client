import React, { useEffect, useMemo, useState } from "react";
import { Mail, Tag } from "lucide-react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { FileUploadZone, FormField, FormModal } from "@/components/common";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppForm } from "@/hooks/useAppForm";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  CUSTOM_EVENT_TYPE,
  DEFAULT_EMAIL_TEMPLATE_VALUES,
  EMAIL_TEMPLATE_EVENT_PRESETS,
} from "../constants";
import {
  emailTemplateSchema,
  type EmailTemplateFormData,
} from "../schemas";
import type { EmailTemplate, EmailTemplatePayload } from "../types";
import {
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
} from "../api";

interface EmailTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit?: EmailTemplate | null;
  templateToDuplicate?: EmailTemplate | null;
  presetKey?: string | null;
  onSuccess?: () => void;
}

type CursorField = "subject" | "body";
type ContentSource = "template" | "html_file";

const isHtmlDocument = (content: string): boolean =>
  /^\s*(<!doctype\s+html|<html[\s>])/i.test(content);

const normalizeCustomEventType = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

export const EmailTemplateFormModal: React.FC<
  EmailTemplateFormModalProps
> = ({
  isOpen,
  onClose,
  templateToEdit,
  templateToDuplicate,
  presetKey,
  onSuccess,
}) => {
  const [activeCursorField, setActiveCursorField] = useState<CursorField>("body");
  const [htmlFileName, setHtmlFileName] = useState("");
  const [createTemplate, { isLoading: isCreating }] = useCreateEmailTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateEmailTemplateMutation();

  const isEditMode = Boolean(templateToEdit);
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useAppForm<EmailTemplateFormData>({
    schema: emailTemplateSchema,
    defaultValues: DEFAULT_EMAIL_TEMPLATE_VALUES,
  });

  const selectedEventType = watch("event_type");
  const isCustomEvent = selectedEventType === CUSTOM_EVENT_TYPE;
  const contentSource = watch("content_source");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setHtmlFileName("");
    const sourceTemplate = templateToEdit || templateToDuplicate;
    if (sourceTemplate) {
      const hasHtmlDocument = isHtmlDocument(sourceTemplate.body);
      const isPreset = EMAIL_TEMPLATE_EVENT_PRESETS.some(
        (preset) => preset.key === sourceTemplate.event_type,
      );
      reset({
        name: templateToDuplicate
          ? sourceTemplate.name + " (Copy)"
          : sourceTemplate.name,
        event_type: isPreset ? sourceTemplate.event_type : CUSTOM_EVENT_TYPE,
        custom_event_type: templateToDuplicate
          ? sourceTemplate.event_type + "_copy"
          : isPreset
            ? ""
            : sourceTemplate.event_type,
        content_source: hasHtmlDocument ? "html_file" : "template",
        subject: sourceTemplate.subject,
        body: hasHtmlDocument ? "" : sourceTemplate.body,
        html_content: hasHtmlDocument ? sourceTemplate.body : "",
        is_active: templateToDuplicate ? true : sourceTemplate.is_active,
      });
      setHtmlFileName(hasHtmlDocument ? "Saved HTML template" : "");
      return;
    }

    const preset = EMAIL_TEMPLATE_EVENT_PRESETS.find(
      (item) => item.key === presetKey,
    );
    reset({
      ...DEFAULT_EMAIL_TEMPLATE_VALUES,
      name: preset?.label || "",
      content_source: "html_file",
      event_type:
        preset?.key || DEFAULT_EMAIL_TEMPLATE_VALUES.event_type,
    });
  }, [
    isOpen,
    presetKey,
    reset,
    templateToDuplicate,
    templateToEdit,
  ]);

  const selectedPreset = useMemo(
    () =>
      EMAIL_TEMPLATE_EVENT_PRESETS.find(
        (preset) => preset.key === selectedEventType,
      ),
    [selectedEventType],
  );

  const availableVariables = useMemo(() => {
    if (selectedPreset) {
      return [...selectedPreset.variables];
    }

    return Array.from(
      new Set(
        EMAIL_TEMPLATE_EVENT_PRESETS.flatMap((preset) => [
          ...preset.variables,
        ]),
      ),
    );
  }, [selectedPreset]);

  const handleContentSourceChange = (source: ContentSource) => {
    setValue("content_source", source, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const insertVariable = (variableName: string) => {
    const placeholder = "{" + variableName + "}";
    const existingValue = getValues(activeCursorField) || "";
    setValue(activeCursorField, existingValue + placeholder, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleHtmlFileChange = async (file: File) => {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".html")) {
      throw new Error("Please select an .html file");
    }

    try {
      const content = await file.text();
      if (!content.trim()) {
        throw new Error("The selected HTML file is empty");
      }
      if (content.length > 65535) {
        throw new Error("HTML file content must be 65535 characters or fewer");
      }
      setHtmlFileName(file.name);
      setValue("html_content", content, {
        shouldDirty: true,
        shouldValidate: true,
      });
      toast.success("HTML template loaded");
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error("Unable to read the selected HTML file");
    }
  };

  const clearHtmlFile = () => {
    setHtmlFileName("");
    setValue("html_content", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: EmailTemplateFormData) => {
    const eventType =
      data.event_type === CUSTOM_EVENT_TYPE
        ? normalizeCustomEventType(data.custom_event_type || "")
        : data.event_type;

    const payload: EmailTemplatePayload = {
      name: data.name.trim(),
      event_type: eventType,
      subject: data.subject.trim(),
      body:
        data.content_source === "html_file"
          ? data.html_content.trim()
          : data.body.trim(),
      is_active: data.is_active,
    };

    try {
      if (isEditMode && templateToEdit) {
        await updateTemplate({
          id: templateToEdit.id,
          data: payload,
        }).unwrap();
        toast.success("Email template updated successfully");
      } else {
        await createTemplate(payload).unwrap();
        toast.success("Email template created successfully");
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        formatApiErrorDetail(
          error?.data || error?.message || "Failed to save email template",
        ),
      );
    }
  };

  const fieldOrder: (keyof EmailTemplateFormData)[] = [
    "name",
    "event_type",
    "custom_event_type",
    "subject",
    "body",
    "html_content",
  ];
  const activeErrorKey = fieldOrder.find((key) => errors[key]);
  const getFieldError = (key: keyof EmailTemplateFormData) =>
    activeErrorKey === key ? errors[key]?.message : undefined;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditMode
          ? "Edit Email Template"
          : templateToDuplicate
            ? "Duplicate Email Template"
            : "Create Email Template"
      }
      description="Configure reusable content only. No application event is connected in this phase."
      icon={<Mail size={19} />}
      size="2xl"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitText={isEditMode ? "Save Changes" : "Create Template"}
      loadingText={isEditMode ? "Saving Changes..." : "Creating Template..."}
    >
      <input type="hidden" {...register("event_type")} />
      <input type="hidden" {...register("custom_event_type")} />
      <input type="hidden" {...register("content_source")} />
      <input type="hidden" {...register("html_content")} />

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            label="Template Name"
            required
            error={getFieldError("name")}
          >
            <Input
              placeholder="e.g. Community Announcement Alert"
              disabled={isSubmitting}
              autoFocus
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Event Trigger"
            required
            error={getFieldError("event_type")}
          >
            <Select
              value={selectedEventType}
              onValueChange={(value) =>
                setValue("event_type", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              options={[
                ...EMAIL_TEMPLATE_EVENT_PRESETS.map((preset) => ({
                  value: preset.key,
                  label: preset.label,
                  description: preset.category,
                })),
                {
                  value: CUSTOM_EVENT_TYPE,
                  label: "Custom Event Trigger",
                },
              ]}
              disabled={isSubmitting}
              error={Boolean(getFieldError("event_type"))}
            />
          </FormField>
        </div>

        {isCustomEvent ? (
          <FormField
            label="Custom Event Key"
            required
            error={getFieldError("custom_event_type")}
            helperText="Use lowercase letters, numbers, and underscores."
          >
            <Input
              placeholder="e.g. package_arrived"
              disabled={isSubmitting}
              value={watch("custom_event_type") || ""}
              onChange={(event) =>
                setValue(
                  "custom_event_type",
                  normalizeCustomEventType(event.target.value),
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  },
                )
              }
            />
          </FormField>
        ) : null}

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Tag size={13} />
              Insert Dynamic Variables
            </p>
            <span className="text-[11px] text-slate-500">
              Target: {activeCursorField}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableVariables.map((variableName) => (
              <button
                key={variableName}
                type="button"
                onClick={() => insertVariable(variableName)}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono text-slate-700 transition hover:border-slate-700 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +{"{" + variableName + "}"}
              </button>
            ))}
          </div>
        </div>

        <FormField
          label="Subject Line"
          required
          error={getFieldError("subject")}
          helperText="Select this field before inserting variables into the subject."
        >
          <Input
            placeholder="[{association_name}] Notification: {title}"
            disabled={isSubmitting}
            className="font-mono"
            onFocus={() => setActiveCursorField("subject")}
            {...register("subject")}
          />
        </FormField>

        <Switch
          checked={contentSource === "html_file"}
          onCheckedChange={(checked) =>
            handleContentSourceChange(checked ? "html_file" : "template")
          }
          disabled={isSubmitting}
          variant="slate"
          label="Use HTML file instead of template editor"
          description="Choose one content source. The other editor is hidden."
        />

        {contentSource === "html_file" ? (
          <FormField
            label="HTML File"
            required
            error={getFieldError("html_content")}
            helperText="Choose a self-contained .html file for this template."
          >
            <FileUploadZone
              key={isOpen ? "open-html" : "closed-html"}
              value={htmlFileName}
              onChange={clearHtmlFile}
              onFileRead={handleHtmlFileChange}
              localOnly
              accept=".html,text/html"
              maxSizeMB={5}
              label="Upload HTML Template"
              helperText="Choose an .html file or drag it here"
              disabled={isSubmitting}
              error={Boolean(getFieldError("html_content"))}
            />
          </FormField>
        ) : (
          <>
            <FormField
              label="Template HTML / Message Body"
              required
              error={getFieldError("body")}
              helperText="Enter the reusable message content for this template."
            >
              <Textarea
                rows={10}
                placeholder="<p>Hello {homeowner_name},</p>"
                disabled={isSubmitting}
                className="font-mono leading-relaxed"
                onFocus={() => setActiveCursorField("body")}
                {...register("body")}
              />
            </FormField>
          </>
        )}

        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              disabled={isSubmitting}
              variant="slate"
              label="Active Template"
              description="Marks this master record as available for future integrations."
            />
          )}
        />
      </div>
    </FormModal>
  );
};

export default EmailTemplateFormModal;
