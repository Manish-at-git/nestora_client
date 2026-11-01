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
import { useGetBoardVisibleUnitDocumentsQuery } from "@/features/unit-documents/api";
import { UnitDocumentTable } from "@/features/unit-documents/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const DocumentsPage: React.FC = () => {
  const { account } = useAuth();
  const location = useLocation();
  const permissionFeature = location.pathname === "/board-documents"
    ? "board_document"
    : location.pathname === "/resident-documents"
      ? "resident_document"
      : "documents";
  const isBoardDocuments = location.pathname === "/board-documents";
  const { canView, canCreate, isLoading: isPermissionLoading } = usePermission(permissionFeature);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<DocumentRecord | null>(null);
  const [documentToView, setDocumentToView] = useState<DocumentRecord | null>(null);

  usePageHeader({ title: "Documents", description: "Access association bylaws, meeting minutes, policies, and certificates." });

  const { data: associations = [] } = useGetAdminAssociationsQuery(undefined, { skip: !canCreate });
  const { data: documents = [], isLoading, refetch } = useGetDocumentsQuery(undefined, { skip: !canView });
  const { data: residentUploads = [], isLoading: isLoadingResidentUploads } = useGetBoardVisibleUnitDocumentsQuery(undefined, {
    skip: !canView || !isBoardDocuments,
  });

  if (isPermissionLoading) return <div className="flex h-64 items-center justify-center"><LoadingSpinner /></div>;
  if (!canView) return <AccessRestricted moduleName="Documents" showAction />;

  return <div className="space-y-6">
    {isBoardDocuments ? (
      <Tabs defaultValue="board-documents" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="board-documents">Board Documents</TabsTrigger>
          <TabsTrigger value="resident-uploads">Uploaded by Homeowner / Tenant</TabsTrigger>
        </TabsList>
        <TabsContent value="board-documents">
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
        </TabsContent>
        <TabsContent value="resident-uploads">
          <UnitDocumentTable
            documents={residentUploads}
            isAdmin
            isLoading={isLoadingResidentUploads}
            readOnly
          />
        </TabsContent>
      </Tabs>
    ) : (
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
    )}

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
