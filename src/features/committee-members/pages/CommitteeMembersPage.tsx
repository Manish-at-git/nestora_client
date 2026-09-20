import React, { useState, useMemo } from "react";
import { Plus, Search, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useAppSelector } from "@/app/hooks";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetAdminCommitteeMembersQuery,
  useGetDirectoryCommitteeMembersQuery,
} from "../api/committeeMembersApi";
import { CommitteeMemberCard } from "../components/CommitteeMemberCard";
import { CommitteeMemberFormModal } from "../components/CommitteeMemberFormModal";
import { CommitteeMemberOverviewModal } from "../components/CommitteeMemberOverviewModal";
import type { CommitteeMember } from "../types";
import { ROLE_CODE } from "@/constants/roleCodes";

export interface CommitteeMembersPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

const SCOPE_TABS = [
  { value: "all", label: "All Members" },
  { value: "active", label: "Active Terms" },
  { value: "past", label: "Past Terms" },
];

export const CommitteeMembersPage: React.FC<CommitteeMembersPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  const { account } = useAuth();
  const {
    canCreate: canCreatePerm,
    canUpdate: canUpdatePerm,
    canDelete: canDeletePerm,
  } = usePermission("committee_members");

  const globalActiveAssocId = useAppSelector((state) => state.ui.activeAssociationId);

  const [scope, setScope] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [viewingMember, setViewingMember] = useState<CommitteeMember | null>(null);

  const userRole = account?.role_code;
  const userIsAdmin = userRole === ROLE_CODE.SUPER_ADMIN || userRole === ROLE_CODE.ADMIN;
  const canManage = userIsAdmin || canUpdatePerm || canDeletePerm;
  const canCreate = userIsAdmin || canCreatePerm;

  usePageHeader({
    title: "Committee Members Directory",
    description: "Explore appointed committee members, task forces, and community leaders.",
  });

  // Fetch admin associations if not provided
  const { data: fetchedAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !userIsAdmin || adminAssociations.length > 0,
  });

  const effectiveAdminAssociations =
    adminAssociations.length > 0 ? adminAssociations : fetchedAssocs;

  const effectiveAssocId =
    selectedAssociationId && String(selectedAssociationId) !== "ALL"
      ? selectedAssociationId
      : globalActiveAssocId && globalActiveAssocId !== "ALL"
      ? globalActiveAssocId
      : undefined;

  const {
    data: adminMembers = [],
    isLoading: isLoadingAdmin,
  } = useGetAdminCommitteeMembersQuery(
    effectiveAssocId ? { assoc_id: effectiveAssocId } : undefined,
    { skip: !userIsAdmin }
  );

  const {
    data: directoryMembers = [],
    isLoading: isLoadingDirectory,
  } = useGetDirectoryCommitteeMembersQuery(
    effectiveAssocId ? { association_id: effectiveAssocId } : undefined,
    { skip: userIsAdmin }
  );

  const members: CommitteeMember[] = userIsAdmin ? adminMembers : directoryMembers;
  const isLoading = userIsAdmin ? isLoadingAdmin : isLoadingDirectory;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const endDate = m.role_end_date || m.end_date;
      const isPast =
        m.status === "past" ||
        (endDate ? new Date(endDate) < new Date(new Date().setHours(0, 0, 0, 0)) : false);
      const isActive = !isPast;

      let matchesScope = true;
      if (scope === "active") matchesScope = isActive;
      else if (scope === "past") matchesScope = isPast;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.committee_name?.toLowerCase().includes(q) ||
        m.association_name?.toLowerCase().includes(q);

      return matchesScope && matchesSearch;
    });
  }, [members, scope, searchQuery]);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMember(null);
  };

  return (
    <div className="space-y-6 pb-12" data-testid="committee-members-page">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Scope Tabs (Matching Board Members pattern) */}
        {userIsAdmin ? (
          <Tabs value={scope} onValueChange={setScope} className="w-full sm:w-auto overflow-x-auto">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl h-auto flex flex-nowrap">
              {SCOPE_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg text-xs font-medium px-3.5 py-1.5 whitespace-nowrap cursor-pointer"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Users size={14} className="text-emerald-600" />
            <span>Active Appointed Committee Representatives</span>
          </div>
        )}

        {/* Right Search & Appoint Action */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search committee members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm pl-9"
            />
          </div>

          {canCreate && (
            <Button
              type="button"
              onClick={handleOpenCreate}
              data-testid="appoint-committee-member-btn"
              className="cursor-pointer"
            >
              <Plus size={14} className="mr-1.5" /> Appoint Member
            </Button>
          )}
        </div>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-56 bg-slate-100/70 rounded-2xl animate-pulse border border-slate-200/50"
            />
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
            <Users size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No committee members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || scope !== "all"
              ? "No committee members match your active filter criteria."
              : "No committee members have been appointed for this association yet."}
          </p>
          {canCreate && (
            <Button
              type="button"
              onClick={handleOpenCreate}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Plus size={13} className="mr-1" /> Appoint First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map((member) => (
            <CommitteeMemberCard
              key={`${member.committee_id || member.id}-${member.user_id}`}
              member={member}
              canManage={canManage}
              onEdit={handleOpenEdit}
              onOverview={(m) => setViewingMember(m)}
            />
          ))}
        </div>
      )}

      {/* Appoint / Edit Form Modal */}
      <CommitteeMemberFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingMember={editingMember}
        adminAssociations={effectiveAdminAssociations}
        selectedAssociationId={effectiveAssocId}
      />

      {/* Detail Overview Modal */}
      <CommitteeMemberOverviewModal
        isOpen={Boolean(viewingMember)}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
      />
    </div>
  );
};

export default CommitteeMembersPage;
