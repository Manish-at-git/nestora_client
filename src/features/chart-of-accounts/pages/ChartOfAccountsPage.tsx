import React, { useMemo, useState } from "react";
import { Search, UploadCloud } from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCOAModal } from "../components/UploadCOAModal";
import { useGetChartOfAccountsQuery } from "../api";
import { ChartOfAccountsTable } from "../components/ChartOfAccountsTable";

export const ChartOfAccountsPage: React.FC = () => {
  const {
    canView,
    canCreate,
    isLoading: permissionLoading,
  } = usePermission("Chart of Accounts");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  usePageHeader({
    title: "Chart of Accounts",
    description:
      "Manage the standardized global chart of accounts used across associations",
  });

  const { data: accounts = [], isLoading } = useGetChartOfAccountsQuery(
    undefined,
    { skip: !canView },
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return accounts;

    return accounts.filter((account) =>
      [account.gl_code, account.gl_name, account.structure, account.grouping].some(
        (value) => String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [accounts, search]);

  if (!permissionLoading && !canView) {
    return <AccessRestricted moduleName="Chart of Accounts" showAction />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="max-w-md flex-1">
          <Input
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ledger codes, account names, structure..."
            className="h-10 rounded-xl"
          />
        </div>

        {canCreate && (
          <Button
            onClick={() => setUploadOpen(true)}
          >
            <UploadCloud className="h-4 w-4" />
            Import Ledger Excel
          </Button>
        )}
      </div>

      <ChartOfAccountsTable accounts={filtered} isLoading={isLoading} />

      {/* Keep the dialog mounted so Radix can play its closing animation. */}
      <UploadCOAModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </div>
  );
};

export default ChartOfAccountsPage;
