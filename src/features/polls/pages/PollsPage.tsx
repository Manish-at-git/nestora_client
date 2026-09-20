import React, { useState, useMemo } from "react";
import { Plus, Search, BarChart2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { useGetProfileDataQuery } from "@/features/profile";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetPollsQuery,
  useDeletePollMutation,
} from "../api/pollsApi";
import { PollCard } from "../components/PollCard";
import { PollFormModal } from "../components/PollFormModal";
import { PollOverviewModal } from "../components/PollOverviewModal";
import type { Poll } from "../types";
import { ROLE_CODE } from "@/constants/roleCodes";

export interface PollsPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

const SCOPE_TABS = [
  { value: "all", label: "All Polls" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "draft", label: "Drafts" },
];

export const PollsPage: React.FC<PollsPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  const { account } = useAuth();
  const globalActiveAssociationId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );
  const {
    canCreate: canCreatePerm,
    canUpdate: canUpdatePerm,
    canDelete: canDeletePerm,
  } = usePermission("polls");

  const [scope, setScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [viewingPoll, setViewingPoll] = useState<Poll | null>(null);

  const userRole = account?.role_code;
  const userIsAdmin =
    userRole === ROLE_CODE.ADMIN || userRole === ROLE_CODE.SUPER_ADMIN;
  const userIsBoard = userRole === ROLE_CODE.BOARD_MEMBER;
  const userHasLockedAssociation =
    userIsBoard ||
    userRole === ROLE_CODE.COMMITTEE_MEMBER ||
    userRole === ROLE_CODE.HOMEOWNER ||
    userRole === ROLE_CODE.TENANT;
  const canCreate = canCreatePerm || userIsAdmin || userIsBoard;

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

  usePageHeader({
    title: "Surveys & Resident Polls",
    description: "Vote on community proposals, improvements, amenities rules, and board resolutions.",
  });

  const {
    data: polls = [],
    isLoading,
  } = useGetPollsQuery(
    effectiveAssociationId
      ? { association_id: effectiveAssociationId }
      : undefined
  );

  const [deletePoll] = useDeletePollMutation();

  const canEdit = (p: Poll) => {
    if (userIsAdmin || canUpdatePerm) return true;
    if (userIsBoard) {
      if (!p.created_at) return false;
      const diffHours =
        (new Date().getTime() - new Date(p.created_at).getTime()) /
        (1000 * 60 * 60);
      return diffHours <= 2;
    }
    return false;
  };

  const canDelete = (p: Poll) => {
    if (userIsAdmin || canDeletePerm) return true;
    if (userIsBoard) {
      if (!p.created_at) return false;
      const diffHours =
        (new Date().getTime() - new Date(p.created_at).getTime()) /
        (1000 * 60 * 60);
      return diffHours <= 2;
    }
    return false;
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      await deletePoll(id).unwrap();
      toast.success("Poll deleted successfully.");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete poll. Please try again.");
    }
  };

  const filteredPolls = useMemo(() => {
    return polls.filter((p) => {
      const isClosed =
        p.status === "Closed" ||
        (p.end_date && new Date(p.end_date) < new Date());
      const isDraft = p.status === "Draft";
      const isActive = !isClosed && !isDraft;

      let matchesScope = true;
      if (scope === "active") matchesScope = isActive;
      else if (scope === "closed") matchesScope = isClosed;
      else if (scope === "draft") matchesScope = isDraft;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.question?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);

      return matchesScope && matchesSearch;
    });
  }, [polls, scope, searchQuery]);

  return (
    <div className="space-y-6 pb-12" data-testid="polls-page">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Scope Tabs */}
        <Tabs value={scope} onValueChange={setScope} className="w-full sm:w-auto overflow-x-auto">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto flex flex-nowrap">
            {SCOPE_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-lg text-xs font-medium px-3.5 py-1.5 whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Right Search, Refresh & Create Button */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search polls & proposals"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {canCreate && (
            <Button
              type="button"
              onClick={() => {
                setEditingPoll(null);
                setIsFormOpen(true);
              }}
              data-testid="create-poll-btn"
            >
              <Plus size={14} /> Create Poll
            </Button>
          )}
        </div>
      </div>

      {/* Polls Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-slate-100/70 rounded-2xl animate-pulse border border-slate-200/50"
            />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
            <BarChart2 size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No polls found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {scope !== "all" || searchQuery
              ? "No community polls match your active filter criteria."
              : "No community polls are active at the moment."}
          </p>
          {canCreate && (
            <Button
              type="button"
              onClick={() => {
                setEditingPoll(null);
                setIsFormOpen(true);
              }}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-semibold"
            >
              <Plus size={13} className="mr-1" /> Create First Poll
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              canEdit={canEdit(poll)}
              canDelete={canDelete(poll)}
              onEdit={(p) => {
                setEditingPoll(p);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
              onOverview={(p) => setViewingPoll(p)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <PollFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPoll(null);
        }}
        initialData={editingPoll}
        adminAssociations={modalAssociations}
        selectedAssociationId={effectiveAssociationId}
        associationsLoading={
          userIsAdmin ? isFetchingAdminAssociations : isFetchingProfile
        }
      />

      {/* Detail Overview Modal */}
      <PollOverviewModal
        isOpen={Boolean(viewingPoll)}
        onClose={() => setViewingPoll(null)}
        poll={viewingPoll}
      />
    </div>
  );
};

export default PollsPage;
