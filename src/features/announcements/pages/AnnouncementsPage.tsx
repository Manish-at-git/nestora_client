import React, { useState, useMemo } from "react";
import { Plus, Search, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { AccessRestricted } from "@/components/common/AccessRestricted";
import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { useGetProfileDataQuery } from "@/features/profile";
import { ROLE_CODE } from "@/constants/roleCodes";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} from "../api/announcementsApi";
import { AnnouncementCard } from "../components/AnnouncementCard";
import { AnnouncementFormModal } from "../components/AnnouncementFormModal";
import type { Announcement, AnnouncementFormData } from "../types";
import type { AnnouncementFormValues } from "../schemas";

export interface AnnouncementsPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

const CATEGORIES = [
  "All",
  "General",
  "Maintenance",
  "Urgent",
  "Celebration",
];

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  usePageHeader({
    title: "Announcements",
    description: "Official association notices, alerts, maintenance schedules, and governance updates.",
  });

  const { account } = useAuth();
  const globalActiveAssociationId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );
  const { canView, canCreate: canCreatePerm, canUpdate, canDelete, isLoading: isPermLoading } =
    usePermission("announcements");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const userRole = account?.role_code;
  const userIsAdmin =
    userRole === ROLE_CODE.SUPER_ADMIN || userRole === ROLE_CODE.ADMIN;
  const userIsBoard = userRole === ROLE_CODE.BOARD_MEMBER;
  const userHasLockedAssociation =
    userIsBoard ||
    userRole === ROLE_CODE.COMMITTEE_MEMBER ||
    userRole === ROLE_CODE.HOMEOWNER ||
    userRole === ROLE_CODE.TENANT;

  // Fallback to role if permissions not explicitly seeded
  const effectiveCanView = canView ?? true;
  const effectiveCanCreate = canCreatePerm ?? (userIsAdmin || userIsBoard);

  const {
    data: fetchedAdminAssociations = [],
    isFetching: isFetchingAdminAssociations,
  } = useGetAdminAssociationsQuery(undefined, {
    skip: !userIsAdmin || adminAssociations.length > 0,
  });

  const { data: profileData, isFetching: isFetchingProfile } =
    useGetProfileDataQuery(undefined, {
      skip: !userHasLockedAssociation,
    });

  const effectiveAdminAssociations =
    adminAssociations.length > 0
      ? adminAssociations
      : fetchedAdminAssociations;

  const memberAssociationId =
    profileData?.association_id || account?.association_id;
  const memberAssociationName =
    profileData?.association_name ||
    profileData?.user_details?.association_name ||
    account?.association_name;

  const modalAssociations = useMemo(() => {
    if (userIsAdmin) {
      return effectiveAdminAssociations;
    }
    if (!memberAssociationId) {
      return [];
    }
    return [
      {
        id: memberAssociationId,
        name:
          memberAssociationName || `Association ${memberAssociationId}`,
      },
    ];
  }, [
    effectiveAdminAssociations,
    memberAssociationId,
    memberAssociationName,
    userIsAdmin,
  ]);

  const selectedAdminAssociationId =
    selectedAssociationId && String(selectedAssociationId) !== "ALL"
      ? selectedAssociationId
      : globalActiveAssociationId && globalActiveAssociationId !== "ALL"
      ? globalActiveAssociationId
      : undefined;

  const effectiveAssociationId = userIsAdmin
    ? selectedAdminAssociationId
    : memberAssociationId;

  const {
    data: announcements = [],
    isLoading,
    refetch,
  } = useGetAnnouncementsQuery(
    effectiveAssociationId ? { association_id: effectiveAssociationId } : undefined
  );

  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation();
  const [deleteAnnouncement] = useDeleteAnnouncementMutation();

  const canEditOrDelete = (a: Announcement) => {
    if (userIsAdmin || canUpdate || canDelete) return true;
    if (userIsBoard) {
      if (!a.created_at) return false;
      const diffHours =
        (new Date().getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
      return diffHours <= 2;
    }
    return false;
  };

  const handleFormSubmit = async (values: AnnouncementFormValues) => {
    const payload: AnnouncementFormData = {
      title: values.title.trim(),
      body: values.body.trim(),
      category: values.category,
      audience: values.audience,
      attachment_url: values.attachment_url,
      association_id: values.association_id || effectiveAssociationId,
      pinned: values.pinned,
    };

    if (editingAnnouncement) {
      await updateAnnouncement({
        id: editingAnnouncement.id,
        data: payload,
      }).unwrap();
    } else {
      await createAnnouncement(payload).unwrap();
    }
    refetch();
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id).unwrap();
      toast.success("Announcement deleted successfully.");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to delete announcement.");
    }
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchesCategory =
          categoryFilter === "All" ||
          a.category?.toLowerCase() === categoryFilter.toLowerCase();
        const matchesSearch =
          !searchQuery.trim() ||
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.body?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
  }, [announcements, categoryFilter, searchQuery]);

  if (isPermLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!effectiveCanView) {
    return (
      <AccessRestricted
        title="Announcements Access Restricted"
        description="Your role does not currently have permission to view community announcements."
      />
    );
  }

  return (
    <div className="space-y-6 pb-8" data-testid="announcements-page">
      {/* Top Controls Bar: Category Filters on Left, Search + Create on Right */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full md:w-auto overflow-x-auto">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto flex flex-nowrap">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 whitespace-nowrap"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search Bar + Publish Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {effectiveCanCreate && (
            <Button
              onClick={() => {
                setEditingAnnouncement(null);
                setIsModalOpen(true);
              }}
              data-testid="create-announcement-btn"
            >
              <Plus size={15} />
              Publish Announcement
            </Button>
          )}
        </div>
      </div>

      {/* Announcements Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-60 bg-slate-100/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          title={searchQuery || categoryFilter !== "All" ? "No matching announcements" : "No Announcements"}
          description={
            searchQuery || categoryFilter !== "All"
              ? "Try adjusting your search query or selecting a different category."
              : "No community bulletins or announcements have been published yet."
          }
          icon={Megaphone}
          action={
            effectiveCanCreate && !searchQuery && categoryFilter === "All"
              ? {
                  label: "Publish Announcement",
                  onClick: () => {
                    setEditingAnnouncement(null);
                    setIsModalOpen(true);
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnnouncements.map((item) => (
            <AnnouncementCard
              key={item.id}
              announcement={item}
              canEditOrDelete={canEditOrDelete(item)}
              isBoardMember={userIsBoard}
              onEdit={(ann) => {
                setEditingAnnouncement(ann);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Publish / Edit Modal */}
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        initialData={editingAnnouncement}
        adminAssociations={modalAssociations}
        selectedAssociationId={effectiveAssociationId}
        onSubmit={handleFormSubmit}
        loading={isCreating || isUpdating}
        associationsLoading={
          userIsAdmin ? isFetchingAdminAssociations : isFetchingProfile
        }
      />
    </div>
  );
};

export default AnnouncementsPage;
