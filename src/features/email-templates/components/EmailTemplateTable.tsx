import React, { useMemo, useState } from "react";
import { Mail, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import {
  DataTable,
  DeleteModal,
  FileActions,
  StatusPill,
  TableRowActions,
  type Column,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FEATURES } from "@/constants/featureCodes";
import { usePermission } from "@/hooks/usePermission";
import { formatApiErrorDetail } from "@/services/api/apiClient";
import {
  useDeleteEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
} from "../api";
import { EMAIL_TEMPLATE_EVENT_PRESETS } from "../constants";
import type { EmailTemplate } from "../types";

interface EmailTemplateTableProps {
  templates: EmailTemplate[];
  isLoading?: boolean;
  onAdd: () => void;
  onEdit: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
  onTest: (template: EmailTemplate) => void;
}

export const EmailTemplateTable: React.FC<EmailTemplateTableProps> = ({
  templates,
  isLoading = false,
  onAdd,
  onEdit,
  onPreview,
  onTest,
}) => {
  const permission = usePermission(FEATURES.EMAIL_TEMPLATES.FEATURE_CODE);
  const canCreate = permission.canCreate || permission.isSuperAdmin;
  const canUpdate = permission.canUpdate || permission.isSuperAdmin;
  const canDelete = permission.canDelete || permission.isSuperAdmin;

  const [templateToDelete, setTemplateToDelete] =
    useState<EmailTemplate | null>(null);
  const [updatingTemplateId, setUpdatingTemplateId] =
    useState<string | null>(null);
  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteEmailTemplateMutation();
  const [updateTemplate] = useUpdateEmailTemplateMutation();

  const isHtmlDocument = (content: string): boolean =>
    /^\s*(<!doctype\s+html|<html[\s>])/i.test(content);

  const getDownloadName = (template: EmailTemplate): string =>
    (
      template.name
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "email-template"
    ) + ".html";

  const getHtmlDataUrl = (template: EmailTemplate): string =>
    "data:text/html;charset=utf-8," + encodeURIComponent(template.body);

  const handleDownload = (template: EmailTemplate) => {
    const blob = new Blob([template.body], {
      type: "text/html;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getDownloadName(template);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleStatusChange = async (
    template: EmailTemplate,
    isActive: boolean,
  ) => {
    setUpdatingTemplateId(template.id);
    try {
      await updateTemplate({
        id: template.id,
        data: {
          name: template.name,
          event_type: template.event_type,
          subject: template.subject,
          body: template.body,
          is_active: isActive,
        },
      }).unwrap();
      toast.success(
        "Email template " + (isActive ? "activated" : "deactivated"),
      );
    } catch (error: any) {
      toast.error(
        formatApiErrorDetail(
          error?.data || error?.message || "Failed to update template status",
        ),
      );
    } finally {
      setUpdatingTemplateId(null);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) {
      return;
    }

    try {
      await deleteTemplate(templateToDelete.id).unwrap();
      toast.success(
        'Email template "' +
          templateToDelete.name +
          '" archived successfully',
      );
      setTemplateToDelete(null);
    } catch (error: any) {
      toast.error(
        formatApiErrorDetail(
          error?.data || error?.message || "Failed to archive email template",
        ),
      );
    }
  };

  const columns = useMemo<Column<EmailTemplate>[]>(() => {
    const baseColumns: Column<EmailTemplate>[] = [
      {
        key: "name",
        header: "Template",
        sortable: true,
        filterable: true,
        minWidth: "220px",
        render: (template) => (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Mail size={15} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {template.name}
              </p>
              <p className="truncate font-mono text-[11px] text-slate-400">
                {template.event_type}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "subject",
        header: "Subject",
        sortable: true,
        filterable: true,
        minWidth: "260px",
        render: (template) => (
          <p className="line-clamp-2 text-xs text-slate-600">
            {template.subject}
          </p>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: false,
        width: "130px",
        render: (template) => {
          const preset = EMAIL_TEMPLATE_EVENT_PRESETS.find(
            (item) => item.key === template.event_type,
          );
          return (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {preset?.category || "Custom"}
            </span>
          );
        },
      },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        width: "150px",
        render: (template) => (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              variant="slate"
              checked={template.is_active}
              onCheckedChange={(checked) =>
                handleStatusChange(template, checked)
              }
              disabled={
                !canUpdate || updatingTemplateId === template.id
              }
              aria-label={
                (template.is_active ? "Deactivate " : "Activate ") +
                template.name
              }
            />
            <StatusPill
              status={template.is_active ? "Active" : "Inactive"}
            />
          </div>
        ),
      },
      {
        key: "updated_at",
        header: "Updated",
        sortable: true,
        width: "130px",
        render: (template) => (
          <span className="whitespace-nowrap text-xs text-slate-500">
            {template.updated_at
              ? new Date(template.updated_at).toLocaleDateString()
              : "N/A"}
          </span>
        ),
      },
      {
        key: "file",
        header: "File",
        sortable: false,
        width: "82px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (template) =>
          isHtmlDocument(template.body) ? (
            <FileActions
              fileUrl={getHtmlDataUrl(template)}
              onDownload={() => handleDownload(template)}
              downloadName={getDownloadName(template)}
              size="sm"
              canOpen={false}
            />
          ) : null,
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "190px",
        className: "text-center",
        headerClassName: "justify-center text-center",
        render: (template) => (
          <TableRowActions
            onView={() => onPreview(template)}
            onEdit={() => onEdit(template)}
            onDelete={() => setTemplateToDelete(template)}
            canView
            canEdit={canUpdate}
            canDelete={canDelete}
            viewTooltip="Preview Email"
            editTooltip="Edit Email Template"
            deleteTooltip="Archive Email Template"
            extraActions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onTest(template)}
                  className="h-7 w-7 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800"
                  title="Send Test Email"
                >
                  <Send size={13} />
                </Button>
              </>
            }
          />
        ),
      },
    ];

    return baseColumns;
  }, [
    canCreate,
    canDelete,
    canUpdate,
    onEdit,
    onPreview,
    onTest,
    updatingTemplateId,
  ]);

  return (
    <>
      <DataTable
        data={templates}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search name, event key, or subject..."
        searchKeys={["name", "event_type", "subject"]}
        emptyTitle="No email templates found"
        emptyMessage="Create a reusable email template master record to get started."
        emptyActionLabel={canCreate ? "Create Email Template" : undefined}
        onEmptyAction={canCreate ? onAdd : undefined}
        headerActions={
          canCreate ? (
            <Button type="button" onClick={onAdd}>
              <Plus size={15} />
              Add Template
            </Button>
          ) : undefined
        }
      />

      <DeleteModal
        isOpen={Boolean(templateToDelete)}
        onClose={() => setTemplateToDelete(null)}
        onDelete={handleDelete}
        title="Archive Email Template"
        itemName={templateToDelete?.name}
        itemType={FEATURES.EMAIL_TEMPLATES.FEATURE_LABEL}
        deleteText="Archive Template"
        isDeleting={isDeleting}
        permanent={false}
      />
    </>
  );
};

export default EmailTemplateTable;
