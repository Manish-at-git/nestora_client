import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ModalWrapper } from "./ModalWrapper";

const COLORS: Record<string, string> = {
  Yes: "#10b981", // emerald-500
  Maybe: "#f59e0b", // amber-500
  No: "#ef4444", // red-500
  "No Response": "#94a3b8", // slate-400
};

export interface MeetingOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
}

export const MeetingOverviewModal: React.FC<MeetingOverviewModalProps> = ({
  isOpen,
  onClose,
  meeting,
}) => {
  const stats = useMemo(
    () =>
      meeting?.attendance_stats || {
        yes_count: 0,
        maybe_count: 0,
        no_count: 0,
        no_response_count: 0,
      },
    [meeting]
  );

  const data = useMemo(
    () =>
      [
        { name: "Yes", value: stats.yes_count || 0 },
        { name: "Maybe", value: stats.maybe_count || 0 },
        { name: "No", value: stats.no_count || 0 },
        { name: "No Response", value: stats.no_response_count || 0 },
      ].filter((item) => item.value > 0),
    [stats]
  );

  const total = useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  );

  if (!isOpen || !meeting) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Attendance Overview"
      description={meeting.title || "Meeting Attendance Breakdown"}
      size="md"
    >
      <div className="space-y-6">
        {total === 0 ? (
          <div className="flex justify-center items-center h-48 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-medium">No RSVPs recorded yet</p>
          </div>
        ) : (
          <div className="h-64 w-full min-h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" debounce={30}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationDuration={350}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name] || "#94a3b8"}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                    fontSize: "12px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5">
            <div className="text-2xl font-bold font-display text-emerald-700">
              {stats.yes_count || 0}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-1">
              Going
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5">
            <div className="text-2xl font-bold font-display text-amber-700">
              {stats.maybe_count || 0}
            </div>
            <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mt-1">
              Maybe
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3.5">
            <div className="text-2xl font-bold font-display text-rose-700">
              {stats.no_count || 0}
            </div>
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider mt-1">
              Not Going
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-3.5">
            <div className="text-2xl font-bold font-display text-slate-700">
              {stats.no_response_count || 0}
            </div>
            <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-1">
              No Response
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default MeetingOverviewModal;
