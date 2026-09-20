import React, { useState, useEffect } from "react";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminAssociation, CommitteeMemberItem } from "../types";
import { CommitteeMemberModal } from "./CommitteeMemberModal";

export interface CommitteeMembersSectionProps {
  associationId: string | number;
  adminAssociations: AdminAssociation[];
}

export const CommitteeMembersSection: React.FC<CommitteeMembersSectionProps> = ({
  associationId,
  adminAssociations,
}) => {
  const [members, setMembers] = useState<CommitteeMemberItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMemberItem | null>(null);

  useEffect(() => {
    if (associationId && String(associationId) !== "ALL") {
      fetchMembers();
    }
  }, [associationId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/admin/committee-members?assoc_id=${associationId}`
      );
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setMembers(list);
    } catch (err) {
      console.error("Error fetching committee members:", err);
      toast.error("Failed to load committee members");
    } finally {
      setLoading(false);
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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
  };

  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Committee Members</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage the committee members for your associations. Assign members to active committees and manage their terms.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => {
              setEditingMember(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add Committee Member
          </Button>
        </div>

        {/* Table */}
        {loading && members.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            Loading committee members...
          </div>
        ) : members.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No committee members found. Click "Add Committee Member" to assign someone.
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-5 py-3.5">MEMBER</th>
                    <th className="px-5 py-3.5">COMMITTEE</th>
                    <th className="px-5 py-3.5">EMAIL</th>
                    <th className="px-5 py-3.5">CONTACT DETAILS</th>
                    <th className="px-5 py-3.5">ROLE START</th>
                    <th className="px-5 py-3.5">ROLE END</th>
                    <th className="px-5 py-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member, idx) => (
                    <tr
                      key={`${member.committee_id}-${member.user_id}-${idx}`}
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
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-medium text-slate-700">
                        {member.committee_name}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {member.email}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {member.phone || "N/A"}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(member.role_start_date)}
                      </td>

                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(member.role_end_date)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingMember(member);
                            setIsModalOpen(true);
                          }}
                          variant="ghost"
                          className="h-auto gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                        >
                          <Edit size={13} /> Edit Dates
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        <CommitteeMemberModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingMember(null);
          }}
          onSuccess={fetchMembers}
          currentAssociationId={associationId}
          adminAssociations={adminAssociations}
          editingMember={editingMember}
        />
      </CardContent>
    </Card>
  );
};

export default CommitteeMembersSection;
