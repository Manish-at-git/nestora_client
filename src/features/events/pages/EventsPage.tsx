import React, { useState, useMemo } from "react";
import { Plus, Search, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { usePermission } from "@/hooks/usePermission";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useGetProfileDataQuery } from "@/features/profile";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetEventsQuery,
  useDeleteEventMutation,
} from "../api/eventsApi";
import { EventCard } from "../components/EventCard";
import { EventFormModal } from "../components/EventFormModal";
import { EventOverviewModal } from "../components/EventOverviewModal";
import type { EventItem } from "../types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROLE_CODE } from "@/constants/roleCodes";

export interface EventsPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

const SCOPE_TABS = [
  { value: "all", label: "All Events" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past Events" },
];

export const EventsPage: React.FC<EventsPageProps> = ({
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
  } = usePermission("events");

  const [scope, setScope] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [viewingEvent, setViewingEvent] = useState<EventItem | null>(null);

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
    title: "Events & Activities",
    description: "Explore upcoming community gatherings, sports, celebrations, and RSVP.",
  });

  const {
    data: events = [],
    isLoading,
  } = useGetEventsQuery({
    scope,
    association_id: effectiveAssociationId,
  });

  const [deleteEvent] = useDeleteEventMutation();

  const canEdit = (e: EventItem) => {
    if (userIsAdmin || canUpdatePerm) return true;
    if (userIsBoard) {
      if (!e.created_at) return false;
      const diffHours = (new Date().getTime() - new Date(e.created_at).getTime()) / (1000 * 60 * 60);
      return diffHours <= 2;
    }
    return false;
  };

  const canDelete = (e: EventItem) => {
    if (userIsAdmin || canDeletePerm) return true;
    if (userIsBoard) {
      if (!e.created_at) return false;
      const diffHours = (new Date().getTime() - new Date(e.created_at).getTime()) / (1000 * 60 * 60);
      return diffHours <= 2;
    }
    return false;
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(id).unwrap();
      toast.success("Event deleted successfully.");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete event. Please try again.");
    }
  };

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  return (
    <div className="space-y-6" data-testid="events-page">
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
              placeholder="Search events & venues"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          {canCreate && (
            <Button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsFormOpen(true);
              }}
              data-testid="create-event-btn"
            >
              <Plus size={14} /> Create Event
            </Button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-100/70 rounded-2xl animate-pulse border border-slate-200/50" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
            <Calendar size={22} />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {scope === "upcoming"
              ? "There are no upcoming scheduled community events at this time."
              : "No events match the selected criteria."}
          </p>
          {canCreate && (
            <Button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsFormOpen(true);
              }}
              variant="outline"
              className="mt-4 rounded-xl text-xs font-semibold"
            >
              <Plus size={13} className="mr-1" /> Host First Event
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              canEdit={canEdit(ev)}
              canDelete={canDelete(ev)}
              onEdit={(e) => {
                setEditingEvent(e);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
              onOverview={(e) => setViewingEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <EventFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        initialData={editingEvent}
        adminAssociations={modalAssociations}
        selectedAssociationId={effectiveAssociationId}
        associationsLoading={
          userIsAdmin ? isFetchingAdminAssociations : isFetchingProfile
        }
      />

      {/* Detail Overview Modal */}
      <EventOverviewModal
        isOpen={Boolean(viewingEvent)}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
      />
    </div>
  );
};

export default EventsPage;
