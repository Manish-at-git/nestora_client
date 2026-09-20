import React, { useState, useMemo } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/common";
import { toast } from "sonner";
import {
  useGetVendorsQuery,
  useDeleteVendorMutation,
} from "../api/vendorsApi";
import { VendorTable, VendorFormModal, ViewVendorModal } from "../components";
import type { Vendor } from "../types";

export type VendorTab = "all" | "draft" | "new" | "mapped";

export const VendorsPage: React.FC = () => {
  const { canView, isLoading: isPermLoading } = usePermission();

  usePageHeader({
    title: "Vendors",
    description:
      "Manage approved contractors, service agencies, maintenance technicians, and vendor contracts",
  });

  const { data: vendors = [], isLoading } = useGetVendorsQuery(undefined, {
    skip: !canView,
  });
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();

  // Tab state
  const [activeTab, setActiveTab] = useState<VendorTab>("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [vendorToView, setVendorToView] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Tab counts
  const allCount = vendors.length;
  const draftCount = useMemo(
    () =>
      vendors.filter((v) => (v.status || "").toLowerCase() === "draft")
        .length,
    [vendors]
  );
  const newCount = useMemo(
    () =>
      vendors.filter(
        (v) =>
          (v.status || "").toLowerCase() !== "draft" &&
          (!v.association_name || v.association_name.trim() === "")
      ).length,
    [vendors]
  );
  const mappedCount = useMemo(
    () =>
      vendors.filter(
        (v) =>
          (v.status || "").toLowerCase() !== "draft" &&
          Boolean(v.association_name && v.association_name.trim() !== "")
      ).length,
    [vendors]
  );

  // Filtered vendors by active tab
  const tabFilteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const isDraft = (v.status || "").toLowerCase() === "draft";
      const hasAssoc = Boolean(
        v.association_name && v.association_name.trim() !== ""
      );

      if (activeTab === "draft") {
        return isDraft;
      } else if (activeTab === "new") {
        return !isDraft && !hasAssoc;
      } else if (activeTab === "mapped") {
        return !isDraft && hasAssoc;
      }
      return true;
    });
  }, [vendors, activeTab]);

  const handleOpenCreate = () => {
    setVendorToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setVendorToEdit(vendor);
    setIsFormModalOpen(true);
  };

  const handleView = (vendor: Vendor) => {
    setVendorToView(vendor);
  };

  const handleDeleteConfirm = async () => {
    if (!vendorToDelete) return;
    try {
      await deleteVendor(vendorToDelete.id).unwrap();
      toast.success("Vendor deleted successfully!");
      setVendorToDelete(null);
    } catch (err: any) {
      toast.error(err?.data || err?.message || "Failed to delete vendor");
    }
  };

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Vendors" showAction />;
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as VendorTab)}
        className="space-y-4"
      >
        {/* Controls and Tabs Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Tabs List */}
          <TabsList className="h-11 rounded-2xl bg-slate-100 p-1 flex-wrap sm:flex-nowrap">
            <TabsTrigger
              value="all"
              className="rounded-xl text-xs font-semibold px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <span>All Vendors</span>
            </TabsTrigger>
            <TabsTrigger
              value="draft"
              className="rounded-xl text-xs font-semibold px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <span>Draft</span>
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="rounded-xl text-xs font-semibold px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <span>New Vendors</span>
            </TabsTrigger>
            <TabsTrigger
              value="mapped"
              className="rounded-xl text-xs font-semibold px-4 py-2 flex items-center gap-2 cursor-pointer"
            >
              <span>Mapped Vendors</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Vendor DataTable */}
        <VendorTable
          vendors={tabFilteredVendors}
          activeTab={activeTab}
          isLoading={isLoading}
          onAdd={handleOpenCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={(vendor) => setVendorToDelete(vendor)}
        />
      </Tabs>

      {/* Modals - Unconditionally mounted for smooth exit animations */}
      <VendorFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setVendorToEdit(null);
        }}
        vendorToEdit={vendorToEdit}
      />

      <ViewVendorModal
        isOpen={Boolean(vendorToView)}
        onClose={() => setVendorToView(null)}
        vendor={vendorToView}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(vendorToDelete)}
        title="Delete Vendor"
        description={`Are you sure you want to delete "${vendorToDelete?.name}"? This will remove all associated contractor records.`}
        confirmText="Delete Vendor"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setVendorToDelete(null)}
      />
    </div>
  );
};

export default VendorsPage;
