import React from "react";
import {
  BarChart2,
  Calendar,
  Info,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Poll, PollOption } from "../types";

export interface PollCardProps {
  poll: Poll;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditOrDelete?: boolean;
  onEdit?: (poll: Poll) => void;
  onDelete?: (id: string | number) => void;
  onOverview?: (poll: Poll) => void;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  canEdit,
  canDelete,
  canEditOrDelete,
  onEdit,
  onDelete,
  onOverview,
}) => {
  const totalVotes =
    poll.total_votes ??
    poll.options?.reduce(
      (acc: number, o: PollOption) =>
        acc + Number(o?.votes_count ?? o?.vote_count ?? 0),
      0
    ) ??
    0;
  const optionsCount = poll.options?.length || 0;
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
        PUBLISHED
      </span>
    );
  };

  const formattedEndDate = poll.end_date
    ? new Date(poll.end_date).toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    })
    : "No end date";

  return (
    <div
      onClick={() => onOverview?.(poll)}
      className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      data-testid={`poll-card-${poll.id}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>{getStatusBadge()}</div>
        </div>

        <h3 className="font-semibold text-base text-slate-900 mb-1 leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
          {poll.question}
        </h3>

        {poll.description ? (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3 break-words [overflow-wrap:anywhere]">
            {poll.description}
          </p>
        ) : (
          <div className="mb-2" />
        )}

        <div className="border-t border-slate-100 my-3" />

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-slate-400 shrink-0" />
            <span>
              <span className="font-medium text-slate-700">{totalVotes}</span>{" "}
              {totalVotes === 1 ? "Vote" : "Votes"} •{" "}
              <span className="font-medium text-slate-700">{optionsCount}</span>{" "}
              Options
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400 shrink-0" />
            <span>
              Visibility:{" "}
              <span className="font-semibold text-slate-800">
                {poll.visibility || "All"}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <span>
              Ends:{" "}
              <span className="text-slate-800 font-medium">
                {formattedEndDate}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-500 shrink-0" />
            <span className="text-slate-600">
              {poll.is_multiple_choice
                ? "Multiple choice allowed"
                : "Single choice only"}
            </span>
          </div>

          {(canEdit || canDelete || canEditOrDelete) && (
            <div className="flex items-center justify-end gap-1 w-full">
              {(canEdit ?? canEditOrDelete) && onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(poll);
                  }}
                  className="h-7 px-3 font-medium text-xs text-slate-600 hover:text-slate-900 rounded-lg cursor-pointer"
                >
                  <Pencil size={13} className="mr-1" /> Edit
                </Button>
              )}
              {(canDelete ?? canEditOrDelete) && onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(poll.id);
                  }}
                  className="h-7 px-3 font-medium text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Trash2 size={12} className="mr-1" /> Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollCard;

