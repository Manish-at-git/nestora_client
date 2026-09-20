import React, { useState, useEffect } from "react";
import apiClient from "@/services/api/apiClient";
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrencySymbol } from "@/utils/currency";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "../components/common/StatCard";

interface AssociationItem {
  id: string | number;
  name: string;
}

export const AccountantDashboard: React.FC = () => {
  const { account } = useAuth();
  const [associations, setAssociations] = useState<AssociationItem[]>([]);
  const [selectedAssociation, setSelectedAssociation] = useState<AssociationItem | null>(null);

  const currencySymbol = getCurrencySymbol(account?.country || "India");

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = async () => {
    try {
      const res = await apiClient.get("/admin/associations");
      const assocs = res.data?.associations || res.data || [];
      const allOption: AssociationItem = { id: "ALL", name: "All Associations" };
      setAssociations([allOption, ...assocs]);
      setSelectedAssociation(allOption);
    } catch (err) {
      console.error("Failed to load associations for accountant", err);
    }
  };

  const cashFlowTrend = [
    { month: "Jan", inc: 45, exp: 32 },
    { month: "Feb", inc: 52, exp: 35 },
    { month: "Mar", inc: 60, exp: 40 },
    { month: "Apr", inc: 58, exp: 42 },
    { month: "May", inc: 70, exp: 45 },
    { month: "Jun", inc: 65, exp: 48 },
    { month: "Jul", inc: 82, exp: 50 },
  ];

  const expenseBreakdown = [
    { cat: "Security Staffing", pct: "35%", amount: "₹4,20,000", color: "bg-blue-500" },
    { cat: "Common Area Electricity", pct: "25%", amount: "₹3,00,000", color: "bg-emerald-500" },
    { cat: "Elevator AMC & Maintenance", pct: "20%", amount: "₹2,40,000", color: "bg-indigo-500" },
    { cat: "Horticulture & Cleaning", pct: "12%", amount: "₹1,44,000", color: "bg-amber-500" },
    { cat: "General Repairs / Misc", pct: "8%", amount: "₹96,000", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Association Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold border border-emerald-100">
              Financial Ledger & Treasury
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-800">
            Accounting & Financial Hub
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitor assessment collections, expenditure vouchers, and cash position.
          </p>
        </div>

        {associations.length > 1 && (
          <div className="relative">
            <select
              value={selectedAssociation?.id || "ALL"}
              onChange={(e) => {
                const found = associations.find((a) => String(a.id) === e.target.value);
                if (found) setSelectedAssociation(found);
              }}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold py-2.5 pl-4 pr-9 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              {associations.map((assoc) => (
                <option key={assoc.id} value={assoc.id}>
                  {assoc.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inflow (MTD)"
          value={`${currencySymbol}14.80L`}
          valueClassName="text-2xl font-bold font-mono text-emerald-600 mt-2"
          subtitle={
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> +12.4% vs last month
            </p>
          }
        />

        <StatCard
          title="Total Expenses (MTD)"
          value={`${currencySymbol}8.45L`}
          valueClassName="text-2xl font-bold font-mono text-rose-600 mt-2"
          subtitle={
            <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
              <TrendingDown size={12} /> Within budget
            </p>
          }
        />

        <StatCard
          title="Dues Collection Rate"
          value="91.2%"
          valueClassName="text-2xl font-bold font-mono text-indigo-600 mt-2"
          subtitle={
            <p className="text-[11px] text-slate-400 mt-1">
              14 accounts overdue
            </p>
          }
        />

        <StatCard
          title="Operating Reserve"
          value={`${currencySymbol}42.5L`}
          valueClassName="text-2xl font-bold font-mono text-slate-900 mt-2"
          subtitle={
            <p className="text-[11px] text-slate-400 mt-1">
              Liquid reserve balance
            </p>
          }
        />
      </div>

      {/* Cashflow Trajectory & Expense Mix Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                Cashflow Inflow vs Outflow
              </h3>
              <p className="text-xs text-slate-500">
                Monthly collections (green) vs operational expenses (red)
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              2026
            </Badge>
          </div>

          {/* Inflow vs Outflow Visualizer */}
          <div className="grid grid-cols-7 gap-3 items-end h-52 pt-4 pb-2 border-b border-slate-100">
            {cashFlowTrend.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="flex gap-1.5 items-end h-full w-full justify-center">
                  <div
                    className="w-1/2 max-w-[16px] bg-emerald-500 rounded-t-md hover:bg-emerald-600 transition-all"
                    style={{ height: `${item.inc}%` }}
                    title={`Inflow: ₹${item.inc}L`}
                  />
                  <div
                    className="w-1/2 max-w-[16px] bg-rose-400 rounded-t-md hover:bg-rose-500 transition-all"
                    style={{ height: `${item.exp}%` }}
                    title={`Outflow: ₹${item.exp}L`}
                  />
                </div>
                <span className="text-xs font-medium text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Maintenance Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Operational Outflow
            </span>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-sm p-6 rounded-3xl">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            Expense Mix Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Current month budget allocation
          </p>

          <div className="space-y-4">
            {expenseBreakdown.map((exp, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{exp.cat}</span>
                  <span className="text-slate-500 font-mono">
                    {exp.amount} ({exp.pct})
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${exp.color} rounded-full`}
                    style={{ width: exp.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccountantDashboard;
