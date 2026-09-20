import React from "react";
import {
  Building2,
  Users,
  Banknote,
  Activity,
  Server,
  Database,
  HardDrive,
  Mail,
  MessageSquare,
  BellRing,
  CreditCard,
  Video,
  MapPin,
  Lock,
  Plus,
  Send,
  FileText,
  UserCheck,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  XCircle,
  User,
  Building,
  Shield,
  Settings,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const revenueData = [
  { name: "Jan", revenue: 400000, mrr: 350000 },
  { name: "Feb", revenue: 450000, mrr: 380000 },
  { name: "Mar", revenue: 520000, mrr: 420000 },
  { name: "Apr", revenue: 480000, mrr: 410000 },
  { name: "May", revenue: 600000, mrr: 500000 },
  { name: "Jun", revenue: 750000, mrr: 650000 },
  { name: "Jul", revenue: 800000, mrr: 700000 },
];

const growthData = [
  { name: "Q1", basic: 10, pro: 5, enterprise: 2 },
  { name: "Q2", basic: 15, pro: 8, enterprise: 3 },
  { name: "Q3", basic: 20, pro: 15, enterprise: 5 },
  { name: "Q4", basic: 25, pro: 22, enterprise: 8 },
];

const complaintData = [
  { name: "Maintenance", value: 45 },
  { name: "Security", value: 25 },
  { name: "Noise", value: 20 },
  { name: "Parking", value: 10 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend: string;
  trendUp: boolean;
  bgClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  bgClass,
}) => (
  <div
    className={`p-6 rounded-2xl border border-slate-100/20 shadow-sm relative overflow-hidden ${bgClass}`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <p className="text-white/80 font-medium text-sm">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-2 font-display">{value}</h3>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold flex items-center gap-1">
          <span>{trendUp ? "▲" : "▼"}</span>
          <span>{trend}</span>
        </span>
        <span className="text-white/70 text-xs">vs last month</span>
      </div>
    </div>
  </div>
);

interface SectionCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 ${className}`}
  >
    <h3 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
      {title}
    </h3>
    {children}
  </div>
);

interface HealthIndicatorProps {
  label: string;
  status: "green" | "yellow" | "red";
  icon: React.ComponentType<{ size?: number }>;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  label,
  status,
  icon: Icon,
}) => {
  const statusConfig = {
    green: { color: "text-emerald-500", bg: "bg-emerald-50", dot: "bg-emerald-500" },
    yellow: { color: "text-amber-500", bg: "bg-amber-50", dot: "bg-amber-500" },
    red: { color: "text-rose-500", bg: "bg-rose-50", dot: "bg-rose-500" },
  };

  const cfg = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${cfg.bg} ${cfg.color}`}>
          <Icon size={16} />
        </div>
        <span className="font-medium text-slate-700 text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      </div>
    </div>
  );
};

export const SuperAdminOverview: React.FC = () => {
  const { account, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.name || account?.name || "Hardik";

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-800">
            Welcome Back, {displayName} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Here is the latest overview of the Nestora platform.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-800 font-medium text-xs">
            Platform Health: Excellent
          </span>
          <span className="bg-emerald-200 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded-md">
            96%
          </span>
        </div>
      </div>

      {/* Main KPIs (4-Column Full Width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Associations"
          value="125"
          icon={Building2}
          trend="8%"
          trendUp={true}
          bgClass="bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        <KpiCard
          title="Residents (Active)"
          value="18,450"
          icon={Users}
          trend="12%"
          trendUp={true}
          bgClass="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <KpiCard
          title="Monthly Revenue"
          value="₹1.8 Cr"
          icon={Banknote}
          trend="15%"
          trendUp={true}
          bgClass="bg-gradient-to-br from-violet-500 to-purple-600"
        />
        <KpiCard
          title="Active Users Today"
          value="12,850"
          icon={Activity}
          trend="3%"
          trendUp={false}
          bgClass="bg-gradient-to-br from-orange-400 to-pink-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="Revenue Trend (₹)" className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value / 100000}L`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) =>
                    typeof value === "number"
                      ? [`₹${(value / 100000).toFixed(2)}L`]
                      : [value]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Total Revenue"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="mrr"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorMrr)"
                  name="MRR"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Association Growth">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={growthData}
                margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="basic"
                  stackId="a"
                  fill="#93c5fd"
                  name="Basic"
                  radius={[0, 0, 4, 4]}
                />
                <Bar dataKey="pro" stackId="a" fill="#3b82f6" name="Professional" />
                <Bar
                  dataKey="enterprise"
                  stackId="a"
                  fill="#1e3a8a"
                  name="Enterprise"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Middle Grid (4 Column Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Association Analytics */}
        <SectionCard title="Association Analytics" className="flex flex-col">
          <div className="space-y-3.5 flex-1 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">New (This Month)</span>
              <span className="font-semibold text-slate-800">12</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">Renewals Pending</span>
              <span className="font-semibold text-orange-600">8</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">Expired</span>
              <span className="font-semibold text-red-600">3</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">Inactive</span>
              <span className="font-semibold text-slate-400">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Trial Accounts</span>
              <span className="font-semibold text-blue-600">14</span>
            </div>
          </div>
        </SectionCard>

        {/* User Analytics */}
        <SectionCard title="User Demographics" className="flex flex-col">
          <div className="space-y-3.5 flex-1 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Homeowners
              </span>
              <span className="font-semibold text-slate-800">12,450</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <Users size={14} className="text-indigo-500" /> Tenants
              </span>
              <span className="font-semibold text-slate-800">4,800</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <Building size={14} className="text-emerald-500" /> Board Members
              </span>
              <span className="font-semibold text-slate-800">625</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600 flex items-center gap-2">
                <Shield size={14} className="text-orange-500" /> Security Guards
              </span>
              <span className="font-semibold text-slate-800">550</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 flex items-center gap-2">
                <Settings size={14} className="text-slate-500" /> Admins
              </span>
              <span className="font-semibold text-slate-800">25</span>
            </div>
          </div>
        </SectionCard>

        {/* Financial KPIs */}
        <SectionCard title="Revenue Dashboard" className="flex flex-col">
          <div className="space-y-3.5 flex-1 text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">MRR</span>
              <span className="font-semibold text-slate-800">₹14.5 L</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">ARR</span>
              <span className="font-semibold text-slate-800">₹1.74 Cr</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">Outstanding Fees</span>
              <span className="font-semibold text-red-500">₹2.1 L</span>
            </div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
              <span className="text-slate-600">Total Collections (Mo)</span>
              <span className="font-semibold text-emerald-600">₹12.4 L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Gateway Success</span>
              <span className="font-semibold text-slate-800">99.2%</span>
            </div>
          </div>
        </SectionCard>

        {/* Security & Complaints */}
        <SectionCard title="Complaints Breakdown" className="flex flex-col">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {complaintData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <SectionCard title="Platform Health" className="h-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <HealthIndicator label="API Server" status="green" icon={Server} />
            <HealthIndicator label="Database" status="green" icon={Database} />
            <HealthIndicator label="Storage (S3)" status="green" icon={HardDrive} />
            <HealthIndicator label="Email Service" status="yellow" icon={Mail} />
            <HealthIndicator label="SMS Gateway" status="green" icon={MessageSquare} />
            <HealthIndicator label="Push Notifications" status="green" icon={BellRing} />
            <HealthIndicator label="Payment Gateway" status="green" icon={CreditCard} />
            <HealthIndicator label="CCTV Service" status="red" icon={Video} />
            <HealthIndicator label="Maps API" status="green" icon={MapPin} />
            <HealthIndicator label="Authentication" status="green" icon={Lock} />
          </div>
        </SectionCard>

        {/* AI Insights & Top Associations */}
        <div className="space-y-6 lg:col-span-2 flex flex-col h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {/* AI Insights */}
            <SectionCard
              title={
                <>
                  <Sparkles className="text-amber-500" size={18} />
                  <span>AI Insights</span>
                </>
              }
              className="bg-gradient-to-b from-amber-50/40 to-white border-amber-100"
            >
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-amber-500">
                    <Lightbulb size={15} />
                  </div>
                  <p>
                    <strong>15 associations</strong> have overdue renewals coming up this
                    week.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-red-500">
                    <AlertTriangle size={15} />
                  </div>
                  <p>
                    Payment success rate dropped by <strong>2%</strong> in the last 24
                    hours.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-orange-500">
                    <AlertTriangle size={15} />
                  </div>
                  <p>
                    <strong>4 communities</strong> are experiencing unusually high
                    complaint volumes.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-emerald-500">
                    <TrendingUp size={15} />
                  </div>
                  <p>
                    Visitor traffic increased by <strong>18%</strong> across major cities
                    today.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 text-red-500">
                    <XCircle size={15} />
                  </div>
                  <p>
                    <strong>3 CCTV cameras</strong> are currently offline at Palm Residency.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Quick Actions */}
            <SectionCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/associations")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-600 cursor-pointer group"
                >
                  <Plus className="group-hover:scale-110 transition-transform text-indigo-600" />
                  <span className="text-xs font-medium text-center">Add Association</span>
                </button>
                <button
                  onClick={() => navigate("/announcements")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-600 cursor-pointer group"
                >
                  <Send className="group-hover:scale-110 transition-transform text-indigo-600" />
                  <span className="text-xs font-medium text-center">Broadcast Alert</span>
                </button>
                <button
                  onClick={() => navigate("/financials")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-600 cursor-pointer group"
                >
                  <FileText className="group-hover:scale-110 transition-transform text-indigo-600" />
                  <span className="text-xs font-medium text-center">Generate Invoice</span>
                </button>
                <button
                  onClick={() => navigate("/users")}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all text-slate-600 cursor-pointer group"
                >
                  <UserCheck className="group-hover:scale-110 transition-transform text-indigo-600" />
                  <span className="text-xs font-medium text-center">Add Admin</span>
                </button>
              </div>
            </SectionCard>
          </div>

          {/* Top Associations Table */}
          <SectionCard title="Top Performing Associations" className="flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Rank</th>
                    <th className="px-4 py-3">Association</th>
                    <th className="px-4 py-3">City</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg rounded-br-lg">
                      Collection Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <tr>
                    <td className="px-4 py-3 text-lg">🥇</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Green Valley</td>
                    <td className="px-4 py-3 text-slate-500">Ahmedabad</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Enterprise
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      99%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-lg">🥈</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Palm Residency</td>
                    <td className="px-4 py-3 text-slate-500">Surat</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Professional
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Trial
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      98%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-lg">🥉</td>
                    <td className="px-4 py-3 font-medium text-slate-800">Sky Heights</td>
                    <td className="px-4 py-3 text-slate-500">Pune</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Basic
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-xs font-medium">
                        Pending
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      97%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
