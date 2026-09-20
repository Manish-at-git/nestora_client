import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Tag } from "lucide-react";
import { StatusPill } from "@/components/common/StatusPill";
import type { ChartOfAccount } from "../types";

type AccountNode = ChartOfAccount & { children: AccountNode[] };
type AccountRow = AccountNode & { level: number };

const getStructureVariant = (structure?: string | null) => {
  const value = (structure || "").toLowerCase();
  if (value.includes("asset")) return "info";
  if (value.includes("liab")) return "danger";
  if (value.includes("equity")) return "purple";
  if (value.includes("income") || value.includes("revenue")) return "success";
  if (value.includes("expense")) return "warning";
  return "neutral";
};

const buildAccountTree = (
  accounts: ChartOfAccount[],
  expandedCodes: Set<string>,
): AccountRow[] => {
  const sortedAccounts = [...accounts].sort((a, b) =>
    String(a.gl_code).localeCompare(String(b.gl_code), undefined, {
      numeric: true,
    }),
  );
  const nodeMap = new Map<string, AccountNode>();

  sortedAccounts.forEach((account) => {
    nodeMap.set(account.gl_code, { ...account, children: [] });
  });

  const roots: AccountNode[] = [];

  sortedAccounts.forEach((account) => {
    const code = String(account.gl_code).replace(/0+$/, "");
    let parent: AccountNode | undefined;
    let longestParentCode = -1;

    sortedAccounts.forEach((candidate) => {
      if (candidate.gl_code === account.gl_code) return;

      const candidateCode = String(candidate.gl_code).replace(/0+$/, "");
      if (
        candidateCode &&
        code.startsWith(candidateCode) &&
        candidateCode.length > longestParentCode
      ) {
        parent = nodeMap.get(candidate.gl_code);
        longestParentCode = candidateCode.length;
      }
    });

    const node = nodeMap.get(account.gl_code)!;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const rows: AccountRow[] = [];
  const visit = (node: AccountNode, level: number) => {
    rows.push({ ...node, level });
    if (expandedCodes.has(node.gl_code)) {
      node.children.forEach((child) => visit(child, level + 1));
    }
  };

  roots.forEach((root) => visit(root, 0));
  return rows;
};

interface ChartOfAccountsTableProps {
  accounts: ChartOfAccount[];
  isLoading?: boolean;
}

export const ChartOfAccountsTable: React.FC<ChartOfAccountsTableProps> = ({
  accounts,
  isLoading = false,
}) => {
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const rows = useMemo(
    () => buildAccountTree(accounts, expandedCodes),
    [accounts, expandedCodes],
  );

  const toggleAccount = (code: string) => {
    setExpandedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
        Loading chart of accounts...
      </div>
    );
  }

  if (!accounts.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
        No chart of accounts found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <style>{`@keyframes coa-row-in { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-20 px-4 py-3 text-center">Sr. No.</th>
              <th className="w-44 px-4 py-3">GL Code</th>
              <th className="px-4 py-3">Account Ledger Name</th>
              <th className="w-52 px-4 py-3">Structure</th>
              <th className="w-64 px-4 py-3">Grouping / Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((account, index) => {
              const isExpanded = expandedCodes.has(account.gl_code);
              const rowTone =
                account.level === 0
                  ? "bg-indigo-50/80 hover:bg-indigo-100/80"
                  : account.level === 1
                    ? "bg-sky-50/65 hover:bg-sky-100/70"
                    : account.level === 2
                      ? "bg-slate-50/90 hover:bg-slate-100"
                      : "bg-white hover:bg-indigo-50/40";
              const nameTone =
                account.level < 2
                  ? "font-bold text-slate-950"
                  : account.level === 2
                    ? "font-semibold text-slate-800"
                    : "font-medium text-slate-700";
              return (
                <tr
                  key={account.id || account.gl_code}
                  className={`${rowTone} transition-colors duration-200`}
                  style={{ animation: "coa-row-in 220ms ease-out both" }}
                >
                  <td className="px-4 py-3 text-center text-xs font-medium text-slate-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      style={{ paddingLeft: account.level * 24 }}
                    >
                      {account.children.length > 0 ? (
                        <button
                          type="button"
                          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${account.gl_name}`}
                          onClick={() => toggleAccount(account.gl_code)}
                          className="rounded-md p-1 text-slate-500 transition-colors duration-200 hover:bg-indigo-200 hover:text-indigo-700"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6" />
                      )}
                      {String(account.gl_code)?.trim() ? (
                        <span className="rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-slate-800 shadow-sm">
                          {account.gl_code}
                        </span>
                      ) : <></>}
                    </div>
                  </td>
                  <td className={`px-4 py-3 ${nameTone}`}>
                    {account.gl_name}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={account.structure || "General"}
                      variant={getStructureVariant(account.structure) as any}
                      icon={<Tag className="h-3.5 w-3.5" />}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-600">
                    {account.grouping || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
