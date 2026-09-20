import React, { useState, useEffect } from "react";
import { Plus, Clock, StopCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminAssociation, BoardMemberItem } from "../types";
import { BoardMemberModal } from "./BoardMemberModal";

export interface BoardMembersSectionProps {
  associationId: string | number;
  associationName?: string;
  adminAssociations: AdminAssociation[];
}

export const BoardMembersSection: React.FC<BoardMembersSectionProps> = ({
  associationId,
  associationName,
  adminAssociations,
}) => {
  const [boardMembers, setBoardMembers] = useState<BoardMemberItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (associationId && String(associationId) !== "ALL") {
      fetchBoardMembers();
    }
  }, [associationId]);

  const fetchBoardMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/admin/board-members?assoc_id=${associationId}`
      );
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setBoardMembers(list);
    } catch (err) {
      console.error("Error fetching board members:", err);
      toast.error("Failed to load board members");
    } finally {
      setLoading(false);
    }
  };

  const handleEndTerm = async (memberId: string | number) => {
    if (
      !window.confirm(
        "Are you sure you want to end this board member's term early? Their role will revert to Homeowner."
      )
    ) {
      return;
    }

    try {
      await apiClient.put(`/admin/board-members/${memberId}/end-term`);
      toast.success("Term ended successfully.");
      fetchBoardMembers();
    } catch (err) {
      console.error("Error ending term:", err);
      toast.error("Failed to end term");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        {/* Header matching Screenshot 3 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Board Members</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage the board members for your associations. Nominate new members or view historical terms.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Add Board Member
          </Button>
        </div>

        {/* Board Members Table */}
        {loading && boardMembers.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            Loading board members...
          </div>
        ) : boardMembers.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No board members found. Click "Add Board Member" to nominate someone.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-3.5">MEMBER</th>
                    <th className="px-5 py-3.5">ASSOCIATION</th>
                    <th className="px-5 py-3.5">STATUS</th>
                    <th className="px-5 py-3.5">TERM PERIOD</th>
                    <th className="px-5 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {boardMembers.map((member) => {
                    const isActive = member.status === "active";
                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-display text-xs font-semibold shrink-0">
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {member.association_name || associationName || "N/A"}
                        </td>

                        <td className="px-5 py-3.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              <Clock size={12} /> Past
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-slate-600">
                          {formatDate(member.term_start_date)} &mdash;{" "}
                          {formatDate(member.term_end_date)}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          {isActive && (
                            <Button
                              type="button"
                              onClick={() => handleEndTerm(member.id)}
                              variant="ghost"
                              className="h-auto gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <StopCircle size={14} /> End Term
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <BoardMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchBoardMembers}
          currentAssociationId={associationId}
          adminAssociations={adminAssociations}
        />
      </CardContent>
    </Card>
  );
};

export default BoardMembersSection;
