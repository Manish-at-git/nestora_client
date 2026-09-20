import React, { useState } from "react";
import { Building2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AdminAssociation } from "../types";
import { AssociationCard } from "./AssociationCard";

export interface AssociationCardListProps {
  associations: AdminAssociation[];
  isLoading: boolean;
  onSelectAssociation: (association: AdminAssociation) => void;
  selectedAssociationId?: string | number | null;
}

export const AssociationCardList: React.FC<AssociationCardListProps> = ({
  associations,
  isLoading,
  onSelectAssociation,
  selectedAssociationId,
}) => {
  const [search, setSearch] = useState("");

  const filtered = associations.filter((assoc) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      assoc.name.toLowerCase().includes(q) ||
      (assoc.city && assoc.city.toLowerCase().includes(q)) ||
      (assoc.state && assoc.state.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-slate-800">Welcome, Admin</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Here are the associations you are managing.
          </p>
        </div>

        {associations.length > 3 && (
          <div className="w-full sm:w-72 relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search associations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white rounded-xl border-slate-200 text-sm"
            />
          </div>
        )}
      </div>

      {/* Grid of Association Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-52 bg-slate-100 rounded-2xl animate-pulse border border-slate-200/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <Building2 size={48} className="mb-3 opacity-40 text-slate-400" />
          <p className="font-medium text-slate-700">No associations found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search
              ? "No association matches your search query."
              : "No associations mapped to your account."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((assoc) => (
            <AssociationCard
              key={assoc.id}
              association={assoc}
              isSelected={
                selectedAssociationId !== null &&
                String(selectedAssociationId) === String(assoc.id)
              }
              onClick={() => onSelectAssociation(assoc)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssociationCardList;
