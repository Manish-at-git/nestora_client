import React, { useMemo } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Star,
  Building,
  Mail,
  Phone,
  Wrench,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column, StatusPill } from "@/components/common";
import { usePermission } from "@/hooks/usePermission";
import type { Vendor } from "../types";

export interface VendorTableProps {
  vendors: Vendor[];
  isLoading?: boolean;
  activeTab?: string;
  onAdd?: () => void;
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export const VendorTable: React.FC<VendorTableProps> = ({
  vendors,
  isLoading = false,
  activeTab = "all",
  onAdd,
  onView,
  onEdit,
  onDelete,
}) => {
  const { canCreate, canUpdate, canDelete } = usePermission();
  const getVendorDisplayInfo = (vendor: Vendor) => {
    let displayCategory = vendor.vendor_category || "";
    let displaySubCategory = "";

    if (vendor.services_offered_json) {
      try {
        const services =
          typeof vendor.services_offered_json === "string"
            ? JSON.parse(vendor.services_offered_json)
            : vendor.services_offered_json;
        if (Array.isArray(services) && services.length > 0) {
          if (!displayCategory) {
            const cats = Array.from(
              new Set(services.map((s: any) => s.category).filter(Boolean))
            );
            if (cats.length > 0) displayCategory = cats.join(", ");
          }
          const subcats = Array.from(
            new Set(services.map((s: any) => s.subcategory).filter(Boolean))
          );
          if (subcats.length > 0) {
            displaySubCategory = subcats.join(", ");
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }

    if (!displayCategory && vendor.service_type) {
      displayCategory = vendor.service_type;
    }
    if (
      !displaySubCategory &&
      vendor.service_type &&
      displayCategory !== vendor.service_type
    ) {
      displaySubCategory = vendor.service_type;
    }

    let contactName = vendor.contact_person || "";
    let contactNumber = vendor.contact_number || vendor.mobile_number || "";

    if ((!contactName || !contactNumber) && vendor.contact_details_json) {
      try {
        const contacts =
          typeof vendor.contact_details_json === "string"
            ? JSON.parse(vendor.contact_details_json)
            : vendor.contact_details_json;
        if (Array.isArray(contacts) && contacts.length > 0) {
          contactName =
            contactName ||
            contacts[0].name ||
            contacts[0].contact_person ||
            "";
          contactNumber =
            contactNumber ||
            contacts[0].mobile ||
            contacts[0].contact_number ||
            contacts[0].phone ||
            "";
        }
      } catch {
        // Ignore parsing errors
      }
    }

    const rating = parseFloat(String(vendor.vendor_rating || 0)) || 0;

    return {
      displayCategory: displayCategory || "-",
      displaySubCategory: displaySubCategory || "-",
      contactName: contactName || "-",
      contactNumber: contactNumber || "",
      rating,
    };
  };

  const getStatusVariant = (
    status?: string
  ): "success" | "warning" | "danger" | "neutral" => {
    const s = (status || "").toLowerCase();
    if (s === "active") return "success";
    if (s === "draft" || s === "pending" || s === "pending approval")
      return "warning";
    if (s === "suspended" || s === "blacklisted" || s === "inactive")
      return "danger";
    return "neutral";
  };

  const columns = useMemo<Column<Vendor>[]>(
    () => [
      {
        key: "sr_no",
        header: "Sr. No.",
        sortable: false,
        width: "60px",
        className: "text-center",
        render: (_row, index) => (
          <span className="font-medium text-slate-500 text-xs">
            {index + 1}
          </span>
        ),
      },
      {
        key: "vendor_code",
        header: "Code",
        sortable: true,
        filterable: true,
        width: "120px",
        render: (row) =>
          row.vendor_code ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
              {row.vendor_code}
            </span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
      },
      {
        key: "name",
        header: "Vendor Details",
        sortable: true,
        filterable: true,
        width: "200px",
        render: (row) => {
          const displayName = row.name || row.business_name || "Vendor";
          const { rating } = getVendorDisplayInfo(row);

          return (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-100/60">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 text-xs truncate">
                    {displayName}
                  </span>
                  {row.verified_vendor && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                {rating > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5 text-amber-400">
                    <Star size={11} fill="currentColor" />
                    <span className="text-[11px] text-slate-600 font-semibold ml-0.5">
                      {rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        filterable: true,
        width: "150px",
        render: (row) => {
          const { displayCategory } = getVendorDisplayInfo(row);
          return (
            <StatusPill
              variant="neutral"
              shape="rounded"
              size="xs"
              icon={<Wrench size={11} className="text-indigo-600" />}
            >
              {displayCategory}
            </StatusPill>
          );
        },
      },
      {
        key: "service_type",
        header: "Sub Category",
        sortable: true,
        filterable: true,
        width: "150px",
        render: (row) => {
          const { displaySubCategory } = getVendorDisplayInfo(row);
          return (
            <span className="text-xs text-slate-700 truncate" title={displaySubCategory}>
              {displaySubCategory}
            </span>
          );
        },
      },
      {
        key: "contact",
        header: "Contact Info",
        sortable: false,
        width: "170px",
        render: (row) => {
          const { contactName, contactNumber } = getVendorDisplayInfo(row);
          return (
            <div className="flex flex-col gap-0.5 min-w-0">
              {contactName !== "-" && (
                <span className="font-semibold text-slate-800 text-xs truncate">
                  {contactName}
                </span>
              )}
              {contactNumber ? (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{contactNumber}</span>
                </div>
              ) : row.email ? (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{row.email}</span>
                </div>
              ) : contactName === "-" ? (
                <span className="text-xs text-slate-400 italic">No contact info</span>
              ) : null}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        filterable: true,
        width: "110px",
        render: (row) => (
          <StatusPill
            status={row.status || "Active"}
            variant={getStatusVariant(row.status)}
            shape="pill"
            size="xs"
            dot={true}
          >
            {row.status || "Active"}
          </StatusPill>
        ),
      },
      {
        key: "association_name",
        header: "Association",
        sortable: true,
        filterable: true,
        width: "160px",
        render: (row) =>
          row.association_name ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
              <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{row.association_name}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Unmapped</span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        width: "88px",
        className: "text-center",
        headerClassName: "text-center justify-center",
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(row)}
              className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="View Vendor Details"
            >
              <Eye size={14} />
            </Button>
            {canUpdate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(row)}
                className="rounded-lg h-7 w-7 text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                title="Edit Vendor"
              >
                <Pencil size={13} />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(row)}
                className="rounded-lg h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                title="Delete Vendor"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [onView, onEdit, onDelete, canUpdate, canDelete]
  );

  return (
    <DataTable
      data={vendors}
      columns={columns}
      density="compact"
      searchPlaceholder="Search vendors by name, code, service, or association..."
      searchKeys={[
        "name",
        "vendor_code",
        "business_name",
        "vendor_category",
        "service_type",
        "contact_person",
        "email",
        "contact_number",
        "mobile_number",
        "association_name",
      ]}
      enableGlobalFilter={true}
      enableColumnFilters={true}
      enableSorting={true}
      pagination={{
        isServer: false,
        pageSize: 15,
        pageSizeOptions: [15, 25, 50],
      }}
      isLoading={isLoading}
      emptyTitle="No vendors found"
      emptyMessage={
        activeTab === "draft"
          ? "No draft vendors available."
          : activeTab === "new"
          ? "No new unmapped vendors available."
          : activeTab === "mapped"
          ? "No vendors mapped to an association yet."
          : "Get started by registering your first service contractor or vendor."
      }
      emptyActionLabel={canCreate && onAdd ? "+ Add Vendor" : undefined}
      onEmptyAction={canCreate ? onAdd : undefined}
      headerActions={
        canCreate && onAdd && (
          <Button onClick={onAdd}>
            <Plus size={15} className="mr-1.5" />
            <span>Add Vendor</span>
          </Button>
        )
      }
    />
  );
};

export default VendorTable;
