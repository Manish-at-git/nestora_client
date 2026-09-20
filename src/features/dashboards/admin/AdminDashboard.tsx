import React, { useState, useEffect, useMemo } from "react";
import apiClient from "@/services/api/apiClient";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setActiveAssociationId } from "@/app/uiSlice";
import { usePageHeader } from "@/hooks/usePageHeader";
import { AdminAssociation } from "./types";
import {
  AssociationCardList,
  AssociationSettingsView,
} from "./components";

export const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );

  const [associations, setAssociations] = useState<AdminAssociation[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize Page Header with active view
  const isSettingsView = Boolean(
    globalActiveAssocId &&
      globalActiveAssocId !== "ALL" &&
      globalActiveAssocId !== ""
  );

  usePageHeader({
    title: isSettingsView ? "Association Settings" : "Admin Dashboard",
    description: isSettingsView
      ? "Manage rules, configuration, and dates for this association."
      : "Manage your assigned associations and oversee operations.",
  });

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/associations");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.associations || res.data?.data || [];
      setAssociations(list);
    } catch (err) {
      console.error("Failed to load admin associations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected association from Redux state
  const currentAssociation = useMemo(() => {
    if (!isSettingsView) return null;
    return (
      associations.find(
        (a) => String(a.id) === String(globalActiveAssocId)
      ) || null
    );
  }, [associations, globalActiveAssocId, isSettingsView]);

  const handleSelectAssociation = (association: AdminAssociation) => {
    // Updating Redux activeAssociationId synchronizes the navbar/header dropdown
    // and triggers the view to switch to that association's settings
    dispatch(setActiveAssociationId(String(association.id)));
  };

  const handleBackToAll = () => {
    // Resetting to "ALL" synchronizes the header dropdown back to "All Managed Associations"
    // and displays the association card grid
    dispatch(setActiveAssociationId("ALL"));
  };

  return (
    <div className="w-full">
      {isSettingsView ? (
        <AssociationSettingsView
          association={
            currentAssociation ||
            ({
              id: globalActiveAssocId!,
              name: `Association #${globalActiveAssocId}`,
            } as AdminAssociation)
          }
          adminAssociations={associations}
          onBack={handleBackToAll}
        />
      ) : (
        <AssociationCardList
          associations={associations}
          isLoading={loading}
          onSelectAssociation={handleSelectAssociation}
          selectedAssociationId={globalActiveAssocId}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
