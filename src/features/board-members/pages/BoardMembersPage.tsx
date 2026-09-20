import React, { useState, useMemo } from "react";
import { Plus, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/common";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useAppSelector } from "@/app/hooks";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetAdminBoardMembersQuery,
  useGetDirectoryBoardMembersQuery,
  useEndBoardMemberTermMutation,
} from "../api/boardMembersApi";
import { BoardMemberCard } from "../components/BoardMemberCard";
import { BoardMemberFormModal } from "../components/BoardMemberFormModal";
import { BoardMemberOverviewModal } from "../components/BoardMemberOverviewModal";
import type { BoardMember } from "../types";
import { ROLE_CODE } from "@/constants/roleCodes";

export interface BoardMembersPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

const SCOPE_TABS = [
  { value: "all", label: "All Members" },
  { value: "active", label: "Active Terms" },
  { value: "past", label: "Past Terms" },
];

export const BoardMembersPage: React.FC<BoardMembersPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  const { account } = useAuth();
  const {
    canCreate: canCreatePerm,
    canUpdate: canUpdatePerm,
    canDelete: canDeletePerm,
  } = usePermission("board_members");

  const globalActiveAssocId = useAppSelector((state) => state.ui.activeAssociationId);

  const [scope, setScope] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<BoardMember | null>(null);
  const [memberToEndTerm, setMemberToEndTerm] = useState<BoardMember | null>(null);

  const userRole = account?.role_code;
  const userIsAdmin = userRole === ROLE_CODE.ADMIN || userRole === ROLE_CODE.SUPER_ADMIN;
  const canManage = userIsAdmin || canUpdatePerm || canDeletePerm;
  const canCreate = userIsAdmin || canCreatePerm;

  usePageHeader({
    title: "Board of Directors",
    description: "View and manage the elected board representatives of the association.",
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
  } = useGetAdminBoardMembersQuery(
    effectiveAssocId
      ? { assoc_id: effectiveAssocId }
      : undefined,
    { skip: !userIsAdmin }
  );

  const {
    data: directoryMembers = [],
    isLoading: isLoadingDirectory,
  } = useGetDirectoryBoardMembersQuery(
    effectiveAssocId
      ? { association_id: effectiveAssocId }
      : undefined,
    { skip: userIsAdmin }
  );

  const [endTerm, { isLoading: isEndingTerm }] = useEndBoardMemberTermMutation();

  const members: BoardMember[] = userIsAdmin ? adminMembers : directoryMembers;
  const isLoading = userIsAdmin ? isLoadingAdmin : isLoadingDirectory;

  const handleConfirmEndTerm = async () => {
    if (!memberToEndTerm?.id) return;
    try {
      await endTerm(memberToEndTerm.id).unwrap();
      toast.success(`Board term for ${memberToEndTerm.name} ended successfully.`);
      setMemberToEndTerm(null);
    } catch (err: any) {
      toast.error(
        err?.data?.detail || err?.message || "Failed to end term. Please try again."
      );
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const isPast = m.status === "past";
      const isActive = !isPast;

      let matchesScope = true;
      if (scope === "active") matchesScope = isActive;
      else if (scope === "past") matchesScope = isPast;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.association_name?.toLowerCase().includes(q);

      return matchesScope && matchesSearch;
    });
  }, [members, scope, searchQuery]);

  return (
    <div className="space-y-6 pb-12" data-testid="board-members-page">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Scope Tabs (Admin & Historical View) */}
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
            <Shield size={14} className="text-emerald-600" />
            <span>Active Elected Board Representatives</span>
          </div>
        )}

        {/* Right Search & Nominate Action */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[200px] sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search board members"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm pl-9"
            />
          </div>

          {canCreate && (
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              data-testid="nominate-board-member-btn"
              className="cursor-pointer"
            >
              <Plus size={14} className="mr-1.5" /> Nominate Member
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
            <Shield size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No board members found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || scope !== "all"
              ? "No board members match your active filter criteria."
              : "No board members have been nominated for this association yet."}
          </p>
          {canCreate && (
            <Button
              type="button"
              onClick={() => setIsFormOpen(true)}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Plus size={13} className="mr-1" /> Nominate First Member
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map((member) => (
            <BoardMemberCard
              key={member.id || member.account_id}
              member={member}
              canManage={canManage}
              onEndTerm={(m) => setMemberToEndTerm(m)}
              onOverview={(m) => setViewingMember(m)}
            />
          ))}
        </div>
      )}

      {/* Nomination Form Modal */}
      <BoardMemberFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        adminAssociations={effectiveAdminAssociations}
        selectedAssociationId={effectiveAssocId}
      />

      {/* Detail Overview Modal */}
      <BoardMemberOverviewModal
        isOpen={Boolean(viewingMember)}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
      />

      {/* End Term Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(memberToEndTerm)}
        onClose={() => setMemberToEndTerm(null)}
        onConfirm={handleConfirmEndTerm}
        title="End Board Member Term"
        variant="danger"
        confirmText="End Term"
        isLoading={isEndingTerm}
        description={
          memberToEndTerm ? (
            <>
              Are you sure you want to end the board term for{" "}
              <span className="font-semibold text-slate-900">{memberToEndTerm.name}</span> early?
            </>
          ) : undefined
        }
        consequences={[
          "Their access to Board Member privileges and features will be revoked.",
          "Their account role will immediately revert back to Homeowner.",
        ]}
      />
    </div>
  );
};

export default BoardMembersPage;
