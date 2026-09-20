import React from "react";
import {
  BarChart2,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  User,
  Users,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/ModalWrapper";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils";
import type { Poll } from "../types";

export interface PollOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: Poll | null;
}

export const PollOverviewModal: React.FC<PollOverviewModalProps> = ({
  isOpen,
  onClose,
  poll,
}) => {
  if (!poll) return null;

  const totalVotes =
    poll.total_votes ??
    poll.options?.reduce(
      (acc, o) => acc + (o.vote_count ?? o.votes_count ?? 0),
      0
    ) ??
    0;

  const isClosed =
    poll.status === "Closed" ||
    (poll.end_date && new Date(poll.end_date) < new Date());

  const getStatusBadge = () => {
    if (isClosed) {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
          CLOSED
        </span>
      );
    }
    if (poll.status === "Draft") {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          DRAFT
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
        ACTIVE
      </span>
    );
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={poll.question}
      icon={<BarChart2 size={18} className="text-slate-800" />}
      badge={getStatusBadge()}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Description */}
        {poll.description && (
          <div className="bg-slate-50 border border-slate-200/80 text-slate-800 p-4 rounded-2xl flex items-start gap-3 min-w-0">
            <Info className="text-slate-500 shrink-0 mt-0.5" size={18} />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Poll Context & Details
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {poll.description}
              </p>
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <Users size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Audience</p>
              <p className="text-slate-800 font-semibold">
                {poll.visibility || "All Residents"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
              <BarChart2 size={15} />
            </div>
            <div>
              <p className="text-slate-400 font-medium mb-0.5">Voting Type</p>
              <p className="text-slate-800 font-semibold">
                {poll.is_multiple_choice ? "Multiple Choice" : "Single Choice"}
              </p>
            </div>
          </div>

          {poll.end_date && (
            <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <Clock size={15} />
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-0.5">Expires At</p>
                <p className="text-slate-800 font-semibold">
                  {formatDateTime(poll.end_date)}
                </p>
              </div>
            </div>
          )}

          {poll.author_name && (
            <div className="flex items-start gap-3 text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="bg-white p-2 rounded-lg text-slate-600 shadow-2xs shrink-0 border border-slate-100">
                <User size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-slate-400 font-medium mb-0.5">Created By</p>
                <p className="text-slate-800 font-semibold truncate">
                  {poll.author_name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Options & Results Breakdown */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Options & Results</span>
            <span className="text-slate-500 font-normal">Total Votes: {totalVotes}</span>
          </div>

          <div className="space-y-2.5">
            {poll.options?.map((option, idx) => {
              const optText = option.option_text || option.text || `Option ${idx + 1}`;
              const voteCount = option.vote_count ?? option.votes_count ?? 0;
              const percentage =
                option.vote_percentage ??
                (totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0);
              const isMyVote = poll.my_votes?.some(
                (vId) => String(vId) === String(option.id)
              );

              return (
                <div
                  key={option.id ?? idx}
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isMyVote
                      ? "border-blue-300 bg-blue-50/40 text-slate-900 font-medium"
                      : "border-slate-200 bg-slate-50/70 text-slate-700"
                  }`}
                >
                  {/* Progress Fill Bar */}
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 rounded-2xl ${
                      isMyVote ? "bg-blue-200/60" : "bg-slate-200/80"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  <div className="relative flex justify-between items-center text-xs sm:text-sm z-10">
                    <div className="flex items-center gap-2 font-medium">
                      {isMyVote && (
                        <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                      )}
                      <span>{optText}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-700">
                      {percentage}% ({voteCount})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PollOverviewModal;
