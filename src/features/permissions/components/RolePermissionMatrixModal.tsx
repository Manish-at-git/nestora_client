import React, { useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Key,
  Shield,
  CheckCheck,
  Eye,
  RotateCcw,
  CornerDownRight,
  LayoutGrid,
  Link as LinkIcon,
  Building2,
  Globe,
  Lock,
} from "lucide-react";
import { FormModal } from "@/components/common/FormModal";
import { StatusPill } from "@/components/common/StatusPill";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetRolePermissionsMatrixQuery,
  useUpdateRolePermissionsBulkMutation,
} from "../api/permissionsApi";
import type { RolePermissionSummary, RolePermissionMatrixItem } from "../types";

export interface RolePermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RolePermissionSummary | null;
  onSuccess?: () => void;
  readOnly?: boolean;
}

interface LocalPermissionState {
  can_create: boolean;
  can_view: boolean;
  can_update: boolean;
  can_delete: boolean;
  sidebar_order: number;
}

type PermissionField = "can_create" | "can_view" | "can_update" | "can_delete";

const EMPTY_PERMISSION: LocalPermissionState = {
  can_create: false,
  can_view: false,
  can_update: false,
  can_delete: false,
  sidebar_order: 0,
};

interface PermissionStore {
  get: (featureId: string) => LocalPermissionState;
  getAll: () => Record<string, LocalPermissionState>;
  getRevision: () => number;
  subscribe: (featureId: string, listener: () => void) => () => void;
  subscribeAll: (listener: () => void) => () => void;
  update: (
    featureId: string,
    updater: (current: LocalPermissionState) => LocalPermissionState
  ) => void;
  replace: (next: Record<string, LocalPermissionState>) => void;
}

const createPermissionStore = (): PermissionStore => {
  let values: Record<string, LocalPermissionState> = {};
  let revision = 0;
  const rowListeners = new Map<string, Set<() => void>>();
  const allListeners = new Set<() => void>();

  const notifyRow = (featureId: string) => {
    rowListeners.get(featureId)?.forEach((listener) => listener());
  };

  const notifyAll = () => {
    revision += 1;
    allListeners.forEach((listener) => listener());
  };

  return {
    get: (featureId) => values[featureId] || EMPTY_PERMISSION,
    getAll: () => values,
    getRevision: () => revision,
    subscribe: (featureId, listener) => {
      const listeners = rowListeners.get(featureId) || new Set<() => void>();
      listeners.add(listener);
      rowListeners.set(featureId, listeners);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) rowListeners.delete(featureId);
      };
    },
    subscribeAll: (listener) => {
      allListeners.add(listener);
      return () => {
        allListeners.delete(listener);
      };
    },
    update: (featureId, updater) => {
      const current = values[featureId] || EMPTY_PERMISSION;
      const next = updater(current);
      if (next === current) return;
      values = { ...values, [featureId]: next };
      notifyRow(featureId);
      notifyAll();
    },
    replace: (next) => {
      const affectedIds = new Set([...Object.keys(values), ...Object.keys(next)]);
      values = next;
      affectedIds.forEach(notifyRow);
      notifyAll();
    },
  };
};

const usePermissionRow = (store: PermissionStore, featureId: string) => {
  const subscribe = useCallback(
    (listener: () => void) => store.subscribe(featureId, listener),
    [store, featureId]
  );
  const getSnapshot = useCallback(() => store.get(featureId), [store, featureId]);
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

const usePermissionStoreRevision = (store: PermissionStore) => {
  return React.useSyncExternalStore(
    store.subscribeAll,
    store.getRevision,
    store.getRevision
  );
};

interface PermissionCheckboxCellProps {
  store: PermissionStore;
  featureId: string;
  field: PermissionField;
  readOnly: boolean;
}

const PermissionCheckboxCell = React.memo<PermissionCheckboxCellProps>(
  ({ store, featureId, field, readOnly }) => {
    const permission = usePermissionRow(store, featureId);
    return (
      <div className="flex justify-center">
        <Checkbox
          id={`perm-${field}-${featureId}`}
          checked={permission[field]}
          disabled={readOnly}
          onCheckedChange={
            readOnly
              ? undefined
              : () =>
                  store.update(featureId, (current) => ({
                    ...current,
                    [field]: !current[field],
                  }))
          }
        />
      </div>
    );
  }
);
PermissionCheckboxCell.displayName = "PermissionCheckboxCell";

interface SidebarOrderCellProps {
  store: PermissionStore;
  featureId: string;
  featureName: string;
  readOnly: boolean;
}

const SidebarOrderCell = React.memo<SidebarOrderCellProps>(
  ({ store, featureId, featureName, readOnly }) => {
    const permission = usePermissionRow(store, featureId);
    return (
      <input
        aria-label={`Sidebar position for ${featureName}`}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={permission.sidebar_order}
        disabled={readOnly}
        onChange={(event) => {
          const value = event.target.value;
          if (!/^\d*$/.test(value)) return;
          store.update(featureId, (current) => ({
            ...current,
            sidebar_order: value === "" ? 0 : Number(value),
          }));
        }}
        className="h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-center text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
      />
    );
  }
);
SidebarOrderCell.displayName = "SidebarOrderCell";

interface PermissionColumnHeaderProps {
  store: PermissionStore;
  features: RolePermissionMatrixItem[];
  field: PermissionField;
  label: string;
  readOnly: boolean;
  onToggle: (field: PermissionField) => void;
}

const PermissionColumnHeader = React.memo<PermissionColumnHeaderProps>(
  ({ store, features, field, label, readOnly, onToggle }) => {
    usePermissionStoreRevision(store);
    if (readOnly) return <>{label}</>;

    const checkedCount = features.filter((feature) => store.get(feature.feature_id)[field]).length;
    const isAllChecked = features.length > 0 && checkedCount === features.length;
    const isIndeterminate = checkedCount > 0 && checkedCount < features.length;

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle(field);
        }}
        className="group inline-flex items-center justify-center gap-1.5 py-1 px-2 -my-1 rounded-md text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 active:bg-blue-100/60 transition-all cursor-pointer select-none"
        title={
          isAllChecked
            ? `Clear all ${label} permissions (${checkedCount}/${features.length})`
            : `Select all ${label} permissions (${checkedCount}/${features.length})`
        }
      >
        <span>{label}</span>
        <span
          className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[9px] font-bold transition-colors ${
            isAllChecked
              ? "bg-blue-600 text-white"
              : isIndeterminate
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
          }`}
        >
          {isAllChecked ? "✓" : isIndeterminate ? "−" : "+"}
        </span>
      </button>
    );
  }
);
PermissionColumnHeader.displayName = "PermissionColumnHeader";

interface PermissionRowAllCellProps {
  store: PermissionStore;
  featureId: string;
  readOnly: boolean;
}

const PermissionRowAllCell = React.memo<PermissionRowAllCellProps>(
  ({ store, featureId, readOnly }) => {
    const permission = usePermissionRow(store, featureId);
    const isRowFull =
      permission.can_create &&
      permission.can_view &&
      permission.can_update &&
      permission.can_delete;

    if (readOnly) return null;

    return (
      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            store.update(featureId, (current) => ({
              ...current,
              can_create: !isRowFull,
              can_view: !isRowFull,
              can_update: !isRowFull,
              can_delete: !isRowFull,
            }))
          }
          className="h-6 w-6 p-0 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[11px]"
          title={isRowFull ? "Clear row" : "Select all in row"}
        >
          {isRowFull ? "✓" : "+"}
        </Button>
      </div>
    );
  }
);
PermissionRowAllCell.displayName = "PermissionRowAllCell";

interface PermissionAllHeaderProps {
  store: PermissionStore;
  features: RolePermissionMatrixItem[];
  readOnly: boolean;
  onToggle: () => void;
}

const PermissionAllHeader = React.memo<PermissionAllHeaderProps>(
  ({ store, features, readOnly, onToggle }) => {
    usePermissionStoreRevision(store);
    if (readOnly) return <>Row All</>;

    const fullRowsCount = features.filter((feature) => {
      const permission = store.get(feature.feature_id);
      return (
        permission.can_create &&
        permission.can_view &&
        permission.can_update &&
        permission.can_delete
      );
    }).length;
    const isAllFull = features.length > 0 && fullRowsCount === features.length;

    return (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="group inline-flex items-center justify-center gap-1 py-1 px-1.5 -my-1 rounded-md text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 active:bg-blue-100/60 transition-all cursor-pointer select-none"
        title={isAllFull ? "Clear all permissions" : "Select all permissions"}
      >
        <span>Row All</span>
        <span
          className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[9px] font-bold transition-colors ${
            isAllFull
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
          }`}
        >
          {isAllFull ? "✓" : "+"}
        </span>
      </button>
    );
  }
);
PermissionAllHeader.displayName = "PermissionAllHeader";

const ConfiguredFeatureCount = React.memo<{ store: PermissionStore }>(({ store }) => {
  usePermissionStoreRevision(store);
  const count = Object.values(store.getAll()).filter(
    (permission) =>
      permission.can_view ||
      permission.can_create ||
      permission.can_update ||
      permission.can_delete
  ).length;
  return <>{count}</>;
});
ConfiguredFeatureCount.displayName = "ConfiguredFeatureCount";

export const RolePermissionMatrixModal: React.FC<RolePermissionMatrixModalProps> = ({
  isOpen,
  onClose,
  role,
  onSuccess,
  readOnly = false,
}) => {
  const roleId = role?.id || "";
  const { data: matrixData, isLoading } = useGetRolePermissionsMatrixQuery(roleId, {
    skip: !isOpen || !roleId,
  });

  const [updateBulk, { isLoading: isSaving }] = useUpdateRolePermissionsBulkMutation();

  const permissionStoreRef = useRef<PermissionStore | null>(null);
  if (!permissionStoreRef.current) {
    permissionStoreRef.current = createPermissionStore();
  }
  const permissionStore = permissionStoreRef.current;

  // Sync loaded data to local state
  useEffect(() => {
    if (matrixData?.features) {
      const initialMap: Record<string, LocalPermissionState> = {};
      matrixData.features.forEach((f) => {
        initialMap[f.feature_id] = {
          can_create: Boolean(Number(f.can_create)),
          can_view: Boolean(Number(f.can_view)),
          can_update: Boolean(Number(f.can_update)),
          can_delete: Boolean(Number(f.can_delete)),
          sidebar_order: Number(f.sidebar_order ?? 0),
        };
      });
      permissionStore.replace(initialMap);
    }
  }, [matrixData, permissionStore]);

  // Toggle all rows for a specific column ("can_create" | "can_view" | "can_update" | "can_delete")
  const handleColumnToggleAll = useCallback(
    (field: PermissionField) => {
      if (readOnly || !matrixData?.features || matrixData.features.length === 0) return;
      const features = matrixData.features;
      const currentPermissions = permissionStore.getAll();
      const allChecked = features.every((feature) =>
        Boolean(permissionStore.get(feature.feature_id)[field])
      );
      const targetValue = !allChecked;
      const next = { ...currentPermissions };
      features.forEach((feature) => {
        next[feature.feature_id] = {
          ...permissionStore.get(feature.feature_id),
          [field]: targetValue,
        };
      });
      permissionStore.replace(next);
    },
    [readOnly, matrixData, permissionStore]
  );

  // Toggle everything (all rows and all columns)
  const handleToggleEverything = useCallback(() => {
    if (readOnly || !matrixData?.features || matrixData.features.length === 0) return;
    const features = matrixData.features;
    const allChecked = features.every((feature) => {
      const permission = permissionStore.get(feature.feature_id);
      return (
        permission.can_create &&
        permission.can_view &&
        permission.can_update &&
        permission.can_delete
      );
    });
    const targetValue = !allChecked;
    const next = { ...permissionStore.getAll() };
    features.forEach((feature) => {
      next[feature.feature_id] = {
        ...permissionStore.get(feature.feature_id),
        can_create: targetValue,
        can_view: targetValue,
        can_update: targetValue,
        can_delete: targetValue,
      };
    });
    permissionStore.replace(next);
  }, [readOnly, matrixData, permissionStore]);

  // Presets: Grant All
  const handleGrantAll = () => {
    if (readOnly || !matrixData?.features) return;
    const next: Record<string, LocalPermissionState> = {};
    matrixData.features.forEach((f) => {
      next[f.feature_id] = {
        can_create: true,
        can_view: true,
        can_update: true,
        can_delete: true,
        sidebar_order: permissionStore.get(f.feature_id).sidebar_order,
      };
    });
    permissionStore.replace(next);
    toast.info("Full CRUD granted across all features");
  };

  // Presets: View Only
  const handleViewOnly = () => {
    if (readOnly || !matrixData?.features) return;
    const next: Record<string, LocalPermissionState> = {};
    matrixData.features.forEach((f) => {
      next[f.feature_id] = {
        can_create: false,
        can_view: true,
        can_update: false,
        can_delete: false,
        sidebar_order: permissionStore.get(f.feature_id).sidebar_order,
      };
    });
    permissionStore.replace(next);
    toast.info("Read-only access set across all features");
  };

  // Presets: Clear All
  const handleClearAll = () => {
    if (readOnly || !matrixData?.features) return;
    const next: Record<string, LocalPermissionState> = {};
    matrixData.features.forEach((f) => {
      next[f.feature_id] = {
        can_create: false,
        can_view: false,
        can_update: false,
        can_delete: false,
        sidebar_order: permissionStore.get(f.feature_id).sidebar_order,
      };
    });
    permissionStore.replace(next);
    toast.info("All permissions cleared");
  };

  // Save changes
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!role || readOnly) return;

    const payloadPermissions = Object.entries(permissionStore.getAll()).map(([featureId, p]) => ({
      feature_id: featureId,
      can_create: p.can_create,
      can_view: p.can_view,
      can_update: p.can_update,
      can_delete: p.can_delete,
      sidebar_order: p.sidebar_order,
    }));

    try {
      await updateBulk({
        role_id: role.id,
        permissions: payloadPermissions,
      }).unwrap();

      toast.success(`Permissions for role "${role.name}" updated successfully!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to update role permissions"
      );
    }
  };

  // Column Header Renderers with select-whole-column support
  const renderColumnHeader = useCallback(
    (label: string, field: PermissionField) => (
      <PermissionColumnHeader
        store={permissionStore}
        features={matrixData?.features || []}
        field={field}
        label={label}
        readOnly={readOnly}
        onToggle={handleColumnToggleAll}
      />
    ),
    [permissionStore, matrixData?.features, readOnly, handleColumnToggleAll]
  );

  const renderRowAllHeader = useCallback(
    () => (
      <PermissionAllHeader
        store={permissionStore}
        features={matrixData?.features || []}
        readOnly={readOnly}
        onToggle={handleToggleEverything}
      />
    ),
    [permissionStore, matrixData?.features, readOnly, handleToggleEverything]
  );

  // DataTable columns definition
  const columns = useMemo<Column<RolePermissionMatrixItem>[]>(
    () => {
      const baseCols: Column<RolePermissionMatrixItem>[] = [
        {
          key: "sr_no",
          header: "Sr. No.",
          sortable: false,
          width: "56px",
          className: "text-center",
          render: (_row, index) => (
            <span className="font-medium text-slate-500 text-xs">{index + 1}</span>
          ),
        },
        {
          key: "feature_name",
          header: "Feature / Module",
          sortable: true,
          filterable: true,
          width: "240px",
          render: (row) => {
            const isChild = Boolean(row.parent_id);
            return (
              <div className="flex items-center gap-2">
                {isChild ? (
                  <CornerDownRight size={13} className="text-slate-400 shrink-0 ml-3" />
                ) : (
                  <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                    <LayoutGrid size={12} />
                  </div>
                )}
                <span
                  className={`truncate ${
                    !isChild ? "font-semibold text-slate-900" : "text-slate-700"
                  }`}
                >
                  {row.feature_name}
                </span>
              </div>
            );
          },
        },
        {
          key: "feature_code",
          header: "Code / Route",
          sortable: true,
          filterable: true,
          width: "170px",
          render: (row) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] text-slate-600 truncate">
                {row.feature_code}
              </span>
              {row.url && (
                <span className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-1">
                  <LinkIcon size={9} />
                  {row.url}
                </span>
              )}
            </div>
          ),
        },
        {
          key: "sidebar_order",
          header: "Position",
          sortable: true,
          width: "82px",
          className: "text-center",
          headerClassName: "text-center",
          render: (row) => (
            <SidebarOrderCell
              store={permissionStore}
              featureId={row.feature_id}
              featureName={row.feature_name}
              readOnly={readOnly}
            />
          ),
        },
        {
          key: "can_create",
          header: renderColumnHeader("Create", "can_create"),
          sortable: false,
          width: "90px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <PermissionCheckboxCell
              store={permissionStore}
              featureId={row.feature_id}
              field="can_create"
              readOnly={readOnly}
            />
          ),
        },
        {
          key: "can_view",
          header: renderColumnHeader("View", "can_view"),
          sortable: false,
          width: "90px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <PermissionCheckboxCell
              store={permissionStore}
              featureId={row.feature_id}
              field="can_view"
              readOnly={readOnly}
            />
          ),
        },
        {
          key: "can_update",
          header: renderColumnHeader("Update", "can_update"),
          sortable: false,
          width: "90px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <PermissionCheckboxCell
              store={permissionStore}
              featureId={row.feature_id}
              field="can_update"
              readOnly={readOnly}
            />
          ),
        },
        {
          key: "can_delete",
          header: renderColumnHeader("Delete", "can_delete"),
          sortable: false,
          width: "90px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <PermissionCheckboxCell
              store={permissionStore}
              featureId={row.feature_id}
              field="can_delete"
              readOnly={readOnly}
            />
          ),
        },
      ];

      if (!readOnly) {
        baseCols.push({
          key: "actions",
          header: renderRowAllHeader(),
          sortable: false,
          width: "80px",
          className: "text-center",
          headerClassName: "text-center justify-center",
          render: (row) => (
            <PermissionRowAllCell
              store={permissionStore}
              featureId={row.feature_id}
              readOnly={readOnly}
            />
          ),
        });
      }

      return baseCols;
    },
    [
      permissionStore,
      renderColumnHeader,
      renderRowAllHeader,
      readOnly,
    ]
  );

  if (!role) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? "Role Permissions (View Only)" : "Role Permission Matrix"}
      subtitle={
        readOnly
          ? `View configured access and CRUD rules for "${role.name}"`
          : `Configure granular access and CRUD rules for "${role.name}"`
      }
      icon={<Key size={18} className="text-slate-800" />}
      size="5xl"
      // preventOutsideClose={!readOnly}
      // closeOnOutsideClick={readOnly}
      isForm={!readOnly}
      isSubmitting={isSaving}
      submitText={readOnly ? undefined : "Save Permissions"}
      loadingText="Saving Permissions..."
      submitVariant="default"
      onSubmit={readOnly ? undefined : handleSubmit}
      customFooter={
        readOnly ? (
          <div className="flex items-center justify-end w-full">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : undefined
      }
      contentClassName="p-4 sm:p-5 space-y-3"
    >
      <div className="space-y-3">
        {/* Compact Role Meta Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm truncate">{role.name}</span>
                <span className="font-mono text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200/80">
                  {role.code}
                </span>
                <StatusPill
                  variant={role.is_active ? "success" : "neutral"}
                  shape="rounded"
                  size="xs"
                  dot={true}
                >
                  {role.is_active ? "Active" : "Inactive"}
                </StatusPill>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Scope:</span>
              {role.entity_name ? (
                <StatusPill
                  variant="neutral"
                  shape="rounded"
                  size="xs"
                  icon={<Building2 size={11} className="text-slate-500" />}
                >
                  {role.entity_name}
                </StatusPill>
              ) : (
                <StatusPill
                  variant="neutral"
                  shape="rounded"
                  size="xs"
                  icon={<Globe size={11} className="text-slate-500" />}
                >
                  Global Platform
                </StatusPill>
              )}
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <Lock size={12} className="text-slate-400" />
              <span className="text-slate-600">
                <strong className="text-slate-900 font-semibold">
                  <ConfiguredFeatureCount store={permissionStore} />
                </strong> /{" "}
                {matrixData?.features?.length || 70} Configured
              </span>
            </div>
          </div>
        </div>

        {/* Common DataTable Component with Sticky Header and No Pagination for Matrix Modal */}
        <DataTable
          data={matrixData?.features || []}
          columns={columns}
          density="compact"
          stickyHeader={true}
          enablePagination={false}
          enableGlobalFilter={false}
          enableColumnFilters={true}
          enableSorting={true}
          isLoading={isLoading}
          emptyTitle="No features found"
          emptyMessage="No features match your criteria."
        />
      </div>
    </FormModal>
  );
};

export default RolePermissionMatrixModal;
