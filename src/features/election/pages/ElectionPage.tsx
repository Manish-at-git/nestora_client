import React, { useState, useMemo } from "react";
import { Vote, Search, Calendar, ShieldCheck, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { FeatureHeaderBanner } from "@/components/common/FeatureHeaderBanner";
import { EmptyState } from "@/components/common/EmptyState";
import type { Election, ElectionFilter } from "../types";

export interface ElectionPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const ElectionPage: React.FC<ElectionPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  usePageHeader({
    title: "Elections & Voting",
    description: "Cast your vote in board elections and community referendums securely.",
  });

  const { account } = useAuth();
  const [filter, setFilter] = useState<ElectionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Elections state
  const [elections, setElections] = useState<Election[]>([]);

  const filteredElections = useMemo(() => {
    return elections.filter((e) => {
      if (filter === "active" && e.status !== "Active") return false;
      if (filter === "upcoming" && e.status !== "Upcoming") return false;
      if (filter === "completed" && e.status !== "Completed") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchType = e.election_type?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchType) return false;
      }
      return true;
    });
  }, [elections, filter, searchQuery]);

  return (
    <div className="space-y-6 pb-12" data-testid="election-page">
      {/* Header Banner */}
      <FeatureHeaderBanner
        badge="Community Governance"
        badgeColor="indigo"
        title="Elections & Referendums"
        description="Cast your confidential vote in board elections, explore candidate profiles, and view certified election results."
      />

      {/* Security notice banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Tamper-Proof Digital Balloting</p>
            <p className="text-slate-500">Every ballot is cryptographically validated and anonymized per unit.</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
          <CheckCircle2 size={12} className="text-emerald-600" /> Verified Resident Voter
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs Filter */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ElectionFilter)}>
          <TabsList className="h-10 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="all" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              All Ballots
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Active Voting
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl text-xs font-semibold px-4 py-1.5">
              Past Results
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search elections & candidates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white rounded-xl border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Content Stream */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-slate-100/80 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredElections.length === 0 ? (
        <EmptyState
          icon={<Vote size={36} />}
          title="No Active Elections"
          description={
            searchQuery
              ? "No ballots match your search query."
              : "There are currently no active ballots or referendums scheduled for your association."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredElections.map((election) => (
            <div
              key={election.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {election.election_type}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {election.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 mb-2">
                  {election.title}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {election.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> Ends: {new Date(election.end_date).toLocaleDateString()}
                </span>
                <Button className="bg-moss hover:bg-moss-dark text-white rounded-xl text-xs h-8">
                  View Ballot
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectionPage;
