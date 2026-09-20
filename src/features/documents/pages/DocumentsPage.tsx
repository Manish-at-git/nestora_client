import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { AccessRestricted, LoadingSpinner } from "@/components/common";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { useAuth } from "@/context/AuthContext";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import { useGetDocumentsQuery } from "../api";
import { DocumentFormModal, DocumentTable } from "../components";
import type { DocumentRecord } from "../types";

export const DocumentsPage: React.FC = () => {
  const { account } = useAuth();
  const location = useLocation();
  const permissionFeature = location.pathname === "/board-documents"
    ? "board_document"
    : location.pathname === "/resident-documents"
      ? "resident_document"
      : "documents";
  const { canView, canCreate, isLoading: isPermissionLoading } = usePermission(permissionFeature);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentRecord | null>(null);
  const [documentToView, setDocumentToView] = useState<DocumentRecord | null>(null);

  usePageHeader({ title: "Documents", description: "Access association bylaws, meeting minutes, policies, and certificates." });

  const { data: associations = [] } = useGetAdminAssociationsQuery(undefined, { skip: !canCreate });
  const { data: documents = [], isLoading, refetch } = useGetDocumentsQuery(undefined, { skip: !canView });

  if (isPermissionLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;
  if (!canView) return <AccessRestricted moduleName="Documents" showAction />;

  return <div className="space-y-6">
    <DocumentTable
      documents={documents}
      isLoading={isLoading}
      onAdd={() => {
        setDocumentToEdit(null);
        setIsModalOpen(true);
      }}
      onView={setDocumentToView}
      onEdit={(document) => {
        setDocumentToEdit(document);
        setIsModalOpen(true);
      }}
      onDeleted={refetch}
    />

    <DocumentFormModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setDocumentToEdit(null);
      }}
      onSuccess={refetch}
      documentToEdit={documentToEdit}
      associations={associations}
      selectedAssociationId={account?.association_id}
    />

    <DocumentFormModal
      isOpen={Boolean(documentToView)}
      onClose={() => setDocumentToView(null)}
      documentToEdit={documentToView}
      associations={associations}
      selectedAssociationId={account?.association_id}
      mode="view"
    />
  </div>;
};

export default DocumentsPage;
