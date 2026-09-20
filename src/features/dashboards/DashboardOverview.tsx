import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";
import { getCurrencySymbol } from "@/utils/currency";
import { CommentsModal } from "@/components/common/CommentsModal";
import { MeetingOverviewModal } from "@/components/common/MeetingOverviewModal";
import { PendingVisitorApprovals } from "@/components/common/PendingVisitorApprovals";
import { AnnouncementFormModal } from "@/features/announcements";
import { EventFormModal, EventOverviewModal } from "@/features/events";
import { PollFormModal } from "@/features/polls";

import { ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AnnouncementCard,
  PollCard,
  EventCard,
  MeetingCard,
  DuesWidgetCard,
  UpcomingMeetingCard,
  UpcomingEventCard,
  PayDuesModal,
  DashboardHeader,
  QuickPostPublisher,
} from "./components";
import { usePageHeader } from "@/hooks/usePageHeader";

export interface TimelineItem {
  id: string | number;
  item_type: "announcement" | "poll" | "event" | "meeting";
  title?: string;
  body?: string;
  description?: string;
  category?: string;
  audience?: string;
  pinned?: boolean;
  banner_url?: string;
  attachment_url?: string;
  created_at?: string;
  author_name?: string;
  created_by_name?: string;
  like_count?: number;
  comment_count?: number;
  comments_count?: number;
  user_has_liked?: boolean;
  reactions?: Record<string, number>;
  my_reaction?: string | null;
  // Poll fields
  question?: string;
  poll_type?: "Single" | "Multiple";
  expires_at?: string;
  is_active?: boolean;
  total_votes?: number;
  my_votes?: Array<string | number>;
  options?: Array<{
    id: string | number;
    text?: string;
    option_text?: string;
    vote_count?: number;
    vote_percentage?: number;
  }>;
  // Event fields
  starts_at?: string;
  ends_at?: string;
  location?: string;
  my_rsvp_status?: string;
  is_paid?: boolean;
  fee_amount?: number | string;
  is_registration_required?: boolean;
  registration_deadline?: string;
  going_count?: number;
  maybe_count?: number;
  declined_count?: number;
  // Meeting fields
  meeting_date?: string;
  meeting_time?: string;
  venue?: string;
  duration?: string;
  organizer_name?: string;
  priority?: string;
  meeting_link?: string;
  agenda?: string;
  my_attendance_status?: string;
  attendance_stats?: any;
}

export interface DashboardOverviewProps {
  isTenant?: boolean;
  onNavigateTab?: (tabKey: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  isTenant = false,
  onNavigateTab,
}) => {
  usePageHeader({
    title: isTenant ? "Tenant Portal" : "Homeowner Dashboard",
    description: isTenant
      ? "Access your rental unit amenities, maintenance, and announcements."
      : "Access your community features and manage your unit.",
  });

  const { profile, account } = useAuth();
  const [postText, setPostText] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Modals state
  const [isAnnouncementFormOpen, setIsAnnouncementFormOpen] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isPollFormOpen, setIsPollFormOpen] = useState(false);

  const [activeCommentItem, setActiveCommentItem] = useState<{
    id: string | number | null;
    type: "announcement" | "event" | "poll";
    title?: string;
  }>({ id: null, type: "announcement" });

  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const [upcomingMeeting, setUpcomingMeeting] = useState<any>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);

  // Quick dues payment modal
  const [showPayDues, setShowPayDues] = useState(false);

  const limit = 10;
  const displayName = profile?.name || account?.name || account?.email?.split("@")[0] || "User";
  const isBoardMember =
    account?.role === "Board member" ||
    account?.role === "Admin" ||
    account?.role === "Super admin";

  const currencySymbol = getCurrencySymbol(account?.association_country || profile?.country);

  const fetchTimeline = async (currentOffset: number = 0) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/timeline?limit=${limit}&offset=${currentOffset}`);
      if ((res.data?.success || res.data?.ok) && Array.isArray(res.data.data)) {
        if (res.data.data.length < limit) {
          setHasMore(false);
        }
        if (currentOffset === 0) {
          setTimeline(res.data.data);
        } else {
          setTimeline((prev) => [...prev, ...res.data.data]);
        }
      }
    } catch {
      // Fallback
      try {
        const [aRes, eRes, pRes] = await Promise.all([
          apiClient.get("/announcements"),
          apiClient.get("/events?scope=upcoming"),
          apiClient.get("/polls"),
        ]);
        const aList = (aRes.data?.data || aRes.data || []).map((x: any) => ({
          ...x,
          item_type: "announcement" as const,
        }));
        const eList = (eRes.data?.data || eRes.data || []).map((x: any) => ({
          ...x,
          item_type: "event" as const,
        }));
        const pList = (pRes.data?.data || pRes.data || []).map((x: any) => ({
          ...x,
          item_type: "poll" as const,
        }));
        setTimeline([...aList, ...eList, ...pList]);
      } catch {
        toast.error("Failed to load timeline");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingMeeting = async () => {
    try {
      const res = await apiClient.get("/meetings");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const now = new Date();
        const upcoming = list
          .filter((m: any) => {
            const mDate = new Date(`${m.meeting_date}T${m.meeting_time || "00:00:00"}`);
            return mDate >= now;
          })
          .sort((a: any, b: any) => {
            const aDate = new Date(`${a.meeting_date}T${a.meeting_time || "00:00:00"}`).getTime();
            const bDate = new Date(`${b.meeting_date}T${b.meeting_time || "00:00:00"}`).getTime();
            return aDate - bDate;
          });
        setUpcomingMeeting(upcoming[0] || null);
      }
    } catch {
      // ignore
    }
  };

  const fetchUpcomingEvent = async () => {
    try {
      const res = await apiClient.get("/events?scope=upcoming");
      const list = res.data?.data || res.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setUpcomingEvent(list[0]);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTimeline(0);
    fetchUpcomingMeeting();
    fetchUpcomingEvent();
  }, []);

  const handleLoadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchTimeline(nextOffset);
  };

  const handlePublishQuickUpdate = async (title: string) => {
    if (!postText.trim()) {
      toast.error("Please enter a message to publish.");
      return;
    }
    try {
      await apiClient.post("/announcements", {
        title,
        body: postText,
        category: "General",
        audience: "Homeowners",
        association_id: "me",
        pinned: false,
      });
      toast.success("Update published successfully!");
      setPostText("");
      fetchTimeline(0);
    } catch {
      toast.error("Failed to publish update.");
    }
  };

  const handlePollVote = async (
    pollId: string | number,
    optionId: string | number,
    isMultipleChoice?: boolean,
    currentVotes: Array<string | number> = []
  ) => {
    try {
      let newVotes = [...currentVotes];
      if (isMultipleChoice) {
        if (newVotes.includes(optionId)) {
          newVotes = newVotes.filter((id) => id !== optionId);
        } else {
          newVotes.push(optionId);
        }
      } else {
        newVotes = [optionId];
      }

      await apiClient.post(`/polls/${pollId}/vote`, { option_ids: newVotes });
      fetchTimeline(0);
      toast.success("Vote recorded successfully");
    } catch {
      toast.error("Failed to submit vote");
    }
  };

  const handleRSVP = async (meetingId: string | number, status: string) => {
    try {
      await apiClient.post(`/meetings/${meetingId}/attendance`, { status });
      toast.success("RSVP updated!");
      setTimeline((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, my_attendance_status: status } : m))
      );
    } catch {
      toast.error("Failed to update RSVP status");
    }
  };

  const handleEventRSVP = async (eventId: string | number, status: string) => {
    try {
      await apiClient.post(`/events/${eventId}/rsvp`, { status });
      toast.success(status === "going" ? "Successfully registered for event!" : "RSVP updated!");
      setTimeline((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, my_rsvp_status: status } : e))
      );
    } catch {
      toast.error("Failed to update registration status");
    }
  };

  const toggleLike = async (
    id: string | number,
    isLiked?: boolean,
    type: "announcement" | "event" | "poll" = "announcement"
  ) => {
    try {
      setTimeline((prev) =>
        prev.map((item) => {
          if (item.id === id && item.item_type === type) {
            return {
              ...item,
              user_has_liked: !isLiked,
              like_count: isLiked ? (item.like_count || 1) - 1 : (item.like_count || 0) + 1,
            };
          }
          return item;
        })
      );
      const endpoint =
        type === "poll"
          ? `/polls/${id}/like`
          : type === "event"
          ? `/events/${id}/like`
          : `/announcements/${id}/like`;
      await apiClient.post(endpoint);
    } catch {
      toast.error(`Failed to like ${type}`);
      fetchTimeline(0);
    }
  };

  const handlePayDues = async (pin: string) => {
    try {
      await apiClient.post("/wallet/pay-dues", { pin });
      toast.success("Dues payment successful!");
      setShowPayDues(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Payment failed");
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (isoString?: string) => {
    if (!isoString) return { month: "", day: "" };
    const d = new Date(isoString);
    return {
      month: d.toLocaleString("en-US", { month: "short" }),
      day: d.getDate(),
    };
  };

  const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  };

  const isRSVPLocked = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return false;
    const meetingDate = new Date(`${dateStr.split("T")[0]}T${timeStr}`);
    const now = new Date();
    const diffHours = (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  const renderTimelineItem = (item: TimelineItem) => {
    if (item.item_type === "announcement") {
      return (
        <AnnouncementCard
          key={`a-${item.id}`}
          item={item}
          onToggleLike={(id, liked) => toggleLike(id, liked, "announcement")}
          onOpenComments={(info) =>
            setActiveCommentItem({
              id: info.id,
              type: "announcement",
              title: info.title,
            })
          }
          formatDate={formatDate}
        />
      );
    }

    if (item.item_type === "poll") {
      return (
        <PollCard
          key={`p-${item.id}`}
          item={item}
          onVote={handlePollVote}
          onToggleLike={(id, liked) => toggleLike(id, liked, "poll")}
          onOpenComments={(info) =>
            setActiveCommentItem({
              id: info.id,
              type: "poll",
              title: info.title,
            })
          }
          formatDate={formatDate}
        />
      );
    }

    if (item.item_type === "event") {
      return (
        <EventCard
          key={`e-${item.id}`}
          item={item}
          currencySymbol={currencySymbol}
          onRSVP={handleEventRSVP}
          onToggleLike={(id, liked) => toggleLike(id, liked, "event")}
          onOpenComments={(info) =>
            setActiveCommentItem({
              id: info.id,
              type: "event",
              title: info.title,
            })
          }
          formatDate={formatDate}
        />
      );
    }

    if (item.item_type === "meeting") {
      return (
        <MeetingCard
          key={`m-${item.id}`}
          item={item}
          onRSVP={handleRSVP}
          formatShortDate={formatShortDate}
          isRSVPLocked={isRSVPLocked}
        />
      );
    }

    return null;
  };

  return (
    <div>
      {/* Greeting Header */}
      <DashboardHeader displayName={displayName} />

      {/* Quick Board Action Bar */}
      {isBoardMember && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-700 font-semibold uppercase tracking-wider block">
                  Pending Approvals
                </span>
                <span className="text-2xl font-bold font-mono text-indigo-900 mt-1 block">3</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <ShieldAlert size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block">
                  Active Board Tasks
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">7</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle size={20} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50/50 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-700 font-semibold uppercase tracking-wider block">
                  Next AGM / Meeting
                </span>
                <span className="text-sm font-bold text-amber-900 mt-1 block">In 4 Days</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Visitor Approvals Alert */}
      {!isBoardMember ? !isTenant && <PendingVisitorApprovals /> : <></>}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Timeline Feed) */}
        <div className="lg:col-span-2">
          {/* Quick Publish Box for Board Members / Admins */}
          {isBoardMember ? (
            <QuickPostPublisher
              postText={postText}
              onPostTextChange={setPostText}
              onPublish={handlePublishQuickUpdate}
              onOpenAnnouncementModal={() => setIsAnnouncementFormOpen(true)}
              onOpenEventModal={() => setIsEventFormOpen(true)}
              onOpenPollModal={() => setIsPollFormOpen(true)}
            />
          ) : <></>}

          {/* Timeline Stream */}
          <div className="space-y-6">
            {timeline.length === 0 && !loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 shadow-sm">
                No recent activity in your timeline.
              </div>
            ) : (
              timeline.map((item) => renderTimelineItem(item))
            )}

            {hasMore && (
              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-full font-medium hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Loading..." : "Load More Activity"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="space-y-6">
          {/* Dues Widget Card */}
          <DuesWidgetCard
            account={account}
            currencySymbol={currencySymbol}
            isTenant={isTenant}
            onPayDuesClick={() => setShowPayDues(true)}
            getOrdinalSuffix={getOrdinalSuffix}
          />

          {/* Upcoming Meeting Widget Card */}
          <UpcomingMeetingCard
            meeting={upcomingMeeting}
            onViewAgenda={(m) => setSelectedMeeting(m)}
          />

          {/* Upcoming Event Widget Card */}
          <UpcomingEventCard
            event={upcomingEvent}
            currencySymbol={currencySymbol}
            onViewEvent={(e) => setSelectedEvent(e)}
          />
        </div>
      </div>

      {/* Pay Dues PIN Modal */}
      <PayDuesModal
        isOpen={showPayDues}
        onClose={() => setShowPayDues(false)}
        currencySymbol={currencySymbol}
        totalDue={account?.assessment_total_due}
        onPay={handlePayDues}
      />

      {/* Comments Modal */}
      <CommentsModal
        isOpen={!!activeCommentItem.id}
        onClose={() => {
          setActiveCommentItem({ id: null, type: "announcement" });
          fetchTimeline(0);
        }}
        itemId={activeCommentItem.id}
        itemType={activeCommentItem.type}
        itemTitle={activeCommentItem.title}
      />

      {/* Creation Modals */}
      <AnnouncementFormModal
        isOpen={isAnnouncementFormOpen}
        onClose={() => setIsAnnouncementFormOpen(false)}
        onSuccess={() => fetchTimeline(0)}
      />

      <EventFormModal
        isOpen={isEventFormOpen}
        onClose={() => setIsEventFormOpen(false)}
        onSuccess={() => fetchTimeline(0)}
      />

      <PollFormModal
        isOpen={isPollFormOpen}
        onClose={() => setIsPollFormOpen(false)}
        onSuccess={() => fetchTimeline(0)}
      />

      {/* Overview Modals */}
      {selectedMeeting && (
        <MeetingOverviewModal
          isOpen={!!selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
          meeting={selectedMeeting}
        />
      )}

      {selectedEvent && (
        <EventOverviewModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default DashboardOverview;
