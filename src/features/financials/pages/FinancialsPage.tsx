import React, { useState, useMemo } from "react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import {
  FileText,
  Search,
  Plus,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  useGetFinancialReportsQuery,
} from "../api/financialsApi";
import { useGetAssociationsQuery } from "@/features/associations/api";
import {
  FinancialReportsTable,
  PublishReportModal,
} from "../components";

export const FinancialsPage: React.FC = () => {
  const { canView, canCreate, isLoading: isPermLoading } = usePermission();

  usePageHeader({
    title: "Financials",
    description:
      "Published association balance sheets, audited statements, and financial reports",
  });

  const { data: reports = [], isLoading: isLoadingReports } = useGetFinancialReportsQuery(undefined, {
    skip: !canView,
  });
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [selectedAssocFilter, setSelectedAssocFilter] = useState("all");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const { data: associations = [] } = useGetAssociationsQuery(undefined, {
    skip: !canView,
  });

  // Filtered reports
  const filteredReports = useMemo(() => {
    const q = reportSearchQuery.toLowerCase().trim();
    return reports.filter((r) => {
      const title = (r.title || "").toLowerCase();
      const type = (r.report_type || "").toLowerCase();
      const assoc = (r.association_name || "").toLowerCase();
      const month = (r.published_month || "").toLowerCase();

      const matchesSearch =
        !q ||
        title.includes(q) ||
        type.includes(q) ||
        assoc.includes(q) ||
        month.includes(q);

      const matchesAssoc =
        selectedAssocFilter === "all" || r.association_id === selectedAssocFilter;

      return matchesSearch && matchesAssoc;
    });
  }, [reports, reportSearchQuery, selectedAssocFilter]);

  const assocFilterOptions = useMemo(() => [
    { value: "all", label: "All Associations" },
    ...associations.map((a) => ({
      value: a.id,
      label: a.name,
    })),
  ], [associations]);

  if (!isPermLoading && !canView) {
    return <AccessRestricted moduleName="Financials" showAction />;
  }

  return (
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 max-w-md">
              <Input
                leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                type="text"
                value={reportSearchQuery}
                onChange={(e) => setReportSearchQuery(e.target.value)}
                placeholder="Search by title, report type, period..."
                className="h-10 rounded-xl"
              />
            </div>

            <div className="w-56">
              <Select
                icon={<Building className="w-3.5 h-3.5" />}
                size="sm"
                value={selectedAssocFilter}
                onChange={(e) => setSelectedAssocFilter(e.target.value)}
                options={assocFilterOptions}
              />
            </div>
          </div>

          {canCreate && (
            <Button
              onClick={() => setIsPublishModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span>Publish Statement</span>
            </Button>
          )}
        </div>

        {/* Main Content */}
        <FinancialReportsTable
          reports={filteredReports}
          isLoading={isLoadingReports}
        />

        {isPublishModalOpen && (
          <PublishReportModal
            isOpen={isPublishModalOpen}
            onClose={() => setIsPublishModalOpen(false)}
          />
        )}
      </div>
  );
};

export default FinancialsPage;
