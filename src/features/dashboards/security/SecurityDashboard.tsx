import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  UserCheck,
  Truck,
  AlertTriangle,
  Plus,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const SecurityDashboard: React.FC = () => {
  const navigate = useNavigate();

  const todayEntries = [
    { id: 1, name: "Amazon Delivery - Ravi", unit: "Tower A - 402", type: "Delivery", time: "10:14 AM", status: "Inside" },
    { id: 2, name: "Guest: Mr. Sharma", unit: "Villa 12", type: "Visitor", time: "10:30 AM", status: "Inside" },
    { id: 3, name: "Plumber - QuickFix", unit: "Tower B - 105", type: "Staff", time: "09:45 AM", status: "Exit" },
    { id: 4, name: "Swiggy - Amit", unit: "Tower C - 801", type: "Delivery", time: "11:05 AM", status: "Inside" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 bg-white shadow-sm p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Visitors Inside
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 mt-2">14</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">● 6 Pre-approved</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deliveries Logged
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 mt-2">28</p>
          <p className="text-[11px] text-slate-400 mt-1">Today's total parcels</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Domestic Staff Inside
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 mt-2">32</p>
          <p className="text-[11px] text-slate-400 mt-1">Maids, drivers & cooks</p>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm p-5 rounded-3xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Incidents / Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold font-mono text-slate-900 mt-2">0</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">All gates secure</p>
        </Card>
      </div>

      {/* Quick Gate Actions */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display">Gatehouse Quick Entry Wizard</h2>
          <p className="text-xs text-white/70 mt-1">
            Fast-track visitor check-in, parcel acceptance, or verify OTP passes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => navigate("/visitor-management/new")}
            className="bg-moss hover:bg-moss-dark text-white rounded-xl cursor-pointer"
          >
            <Plus size={15} className="mr-1" /> New Visitor Entry
          </Button>
          <Button
            onClick={() => navigate("/deliveries/new")}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl cursor-pointer"
          >
            <Truck size={15} className="mr-1" /> Log Delivery
          </Button>
        </div>
      </div>

      {/* Recent Gate Logs Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-3xl">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
            Live Gate Entry Feed
          </h3>
          <Badge variant="outline" className="text-xs font-mono">
            Realtime
          </Badge>
        </div>
        <div className="divide-y divide-slate-100">
          {todayEntries.map((log) => (
            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-xs">
                  {log.type === "Delivery" ? <Truck size={16} /> : <UserCheck size={16} />}
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-800">{log.name}</p>
                  <p className="text-xs text-slate-500">{log.unit} • {log.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={12} /> {log.time}
                </span>
                <Badge
                  variant={log.status === "Inside" ? "moss" : "default"}
                  className="text-[10px]"
                >
                  {log.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
