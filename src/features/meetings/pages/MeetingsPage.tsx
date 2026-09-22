import React, { useState, useMemo } from "react";
import { Plus, Search, Calendar, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted, EmptyState } from "@/components/common";
import { MeetingOverviewModal } from "@/components/common/MeetingOverviewModal";
import {
  useGetMeetingsQuery,
  useUpdateMeetingAttendanceMutation,
} from "../api/meetingsApi";
import { useAppSelector } from "@/app/hooks";
import {
  ASSOCIATION_DIRECTORY_ROLE_CODES,
  ROLE_CODE,
} from "@/constants/roleCodes";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import { MeetingCard } from "../components/MeetingCard";
import { MeetingFormModal } from "../components/MeetingFormModal";
import { MeetingMinutesModal } from "../components/MeetingMinutesModal";
import type { Meeting } from "../types";

export interface MeetingsPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const MeetingsPage: React.FC<MeetingsPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  usePageHeader({
    title: "Community Meetings",
    description: "Schedule, view agendas, and RSVP for general body and committee meetings.",
  });

  const { account } = useAuth();
  const { canCreate, canUpdate, canView, isLoading: isPermLoading } = usePermission("meetings");
  const [scope, setScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const canLoadAdminAssociations = ASSOCIATION_DIRECTORY_ROLE_CODES.includes(
    account?.role_code as (typeof ASSOCIATION_DIRECTORY_ROLE_CODES)[number],
  );

  // Modals state
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [isMinutesModalOpen, setMinutesModalOpen] = useState(false);
  const [meetingForMinutes, setMeetingForMinutes] = useState<Meeting | null>(null);

  const [isOverviewModalOpen, setOverviewModalOpen] = useState(false);
  const [meetingForOverview, setMeetingForOverview] = useState<Meeting | null>(null);

  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );
  const { data: fetchedAdminAssocs = [] } = useGetAdminAssociationsQuery(undefined, {
    skip: !canLoadAdminAssociations || adminAssociations.length > 0,
  });

  const effectiveAdminAssociations =
    adminAssociations.length > 0 ? adminAssociations : fetchedAdminAssocs;

  const effectiveAssociationId =
    selectedAssociationId && String(selectedAssociationId) !== "ALL"
      ? selectedAssociationId
      : globalActiveAssocId && globalActiveAssocId !== "ALL"
      ? globalActiveAssocId
      : undefined;

  // RTK Query
  const { data: meetings = [], isLoading, refetch } = useGetMeetingsQuery(
    effectiveAssociationId,
    { skip: !canView, refetchOnMountOrArgChange: true },
  );
  const [updateAttendance] = useUpdateMeetingAttendanceMutation();

  const userRoleCode = account?.role_code;
  const userIsAdmin = userRoleCode === ROLE_CODE.ADMIN || userRoleCode === ROLE_CODE.SUPER_ADMIN;
  const userIsBoard = userRoleCode === ROLE_CODE.BOARD_MEMBER;
  const userIsHomeowner = userRoleCode === ROLE_CODE.HOMEOWNER;

  const canSchedule = canCreate;
  const canEditDetails = canUpdate;
  const canAddMinutes = canUpdate;
  const canViewOverview = canUpdate;
  const canRSVP = userIsHomeowner || userIsBoard;

  // Filter and search logic
  const filteredMeetings = useMemo(() => {
    const now = new Date();

    return meetings.filter((meeting) => {
      // Scope filter
      if (scope === "upcoming") {
        if (meeting.meeting_date) {
          const mDate = new Date(`${meeting.meeting_date.split("T")[0]}T${meeting.meeting_time || "00:00:00"}`);
          if (mDate < now || meeting.status === "Completed") return false;
        }
      } else if (scope === "past") {
        if (meeting.meeting_date) {
          const mDate = new Date(`${meeting.meeting_date.split("T")[0]}T${meeting.meeting_time || "23:59:59"}`);
          if (mDate >= now && meeting.status !== "Completed") return false;
        }
      } else if (scope === "completed") {
        if (meeting.status !== "Completed") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = meeting.title?.toLowerCase().includes(q);
        const matchAgenda = meeting.agenda?.toLowerCase().includes(q);
        const matchVenue = meeting.venue?.toLowerCase().includes(q);
        const matchOrganizer = meeting.organizer_name?.toLowerCase().includes(q);
        const matchType = meeting.meeting_type?.toLowerCase().includes(q);
        if (!matchTitle && !matchAgenda && !matchVenue && !matchOrganizer && !matchType) {
          return false;
        }
      }

      return true;
    });
  }, [meetings, scope, searchQuery]);

  const handleRSVP = async (meetingId: string | number, status: string) => {
    try {
      await updateAttendance({ id: meetingId, status }).unwrap();
      toast.success(`RSVP marked as: ${status}`);
    } catch (err: any) {
      toast.error(err.data?.detail || err.message || "Failed to update RSVP");
    }
  };


  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Community Meetings" showAction />;
  }

  return (
    <div className="space-y-6 pb-12" data-testid="meetings-page">     
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <Tabs value={scope} onValueChange={setScope}>
          <TabsList className="h-10 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="all" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              All Meetings
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Past
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative min-w-[240px] sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search meetings & agendas…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {canSchedule && (
            <Button
              onClick={() => {
                setEditingMeeting(null);
                setFormModalOpen(true);
              }}
            >
              <Plus size={16} className="mr-1.5" /> Schedule Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Meetings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-slate-100/80 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredMeetings.length === 0 ? (
        <EmptyState
          icon={<Calendar size={36} />}
          title="No meetings found"
          description={
            searchQuery
              ? "No meetings match your search query."
              : "There are no meetings scheduled in this association."
          }
          actionText={canSchedule ? "Schedule Meeting" : undefined}
          onAction={
            canSchedule
              ? () => {
                  setEditingMeeting(null);
                  setFormModalOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              canRSVP={canRSVP}
              isAdmin={userIsAdmin}
              isBoardOrAdmin={userIsAdmin || userIsBoard}
              canEdit={canEditDetails}
              canAddMinutes={canAddMinutes}
              canViewOverview={canViewOverview}
              onRSVP={handleRSVP}
              onEdit={(m) => {
                setEditingMeeting(m);
                setFormModalOpen(true);
              }}
              onAddMinutes={(m) => {
                setMeetingForMinutes(m);
                setMinutesModalOpen(true);
              }}
              onOverview={(m) => {
                setMeetingForOverview(m);
                setOverviewModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Meeting Create / Edit Form Modal */}
      <MeetingFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingMeeting(null);
        }}
        meetingToEdit={editingMeeting}
        onSuccess={() => refetch()}
        adminAssociations={effectiveAdminAssociations}
        selectedAssociationId={effectiveAssociationId}
      />

      {/* Meeting Minutes Modal */}
      <MeetingMinutesModal
        isOpen={isMinutesModalOpen}
        onClose={() => {
          setMinutesModalOpen(false);
          setMeetingForMinutes(null);
        }}
        meeting={meetingForMinutes}
        onSuccess={() => refetch()}
      />

      {/* Attendance Overview Modal */}
      <MeetingOverviewModal
        isOpen={isOverviewModalOpen}
        onClose={() => {
          setOverviewModalOpen(false);
          setMeetingForOverview(null);
        }}
        meeting={meetingForOverview}
      />
    </div>
  );
};

export default MeetingsPage;
