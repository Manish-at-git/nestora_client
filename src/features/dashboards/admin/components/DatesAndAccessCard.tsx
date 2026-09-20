import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/common";

export interface DatesAndAccessCardProps {
  onboardingDate: string;
  endDate: string;
  onChangeEndDate: (date: string) => void;
}

export const DatesAndAccessCard: React.FC<DatesAndAccessCardProps> = ({
  onboardingDate,
  endDate,
  onChangeEndDate,
}) => {
  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
          Dates & Access
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Onboarding Date
            </label>
            <div className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm">
              {onboardingDate || "Not recorded"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              End Date
            </label>
            <DatePicker
              value={endDate || ""}
              onChange={(value) => onChangeEndDate(String(value || ""))}
              placeholder="Select end date"
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              If set in the past, access will be blocked for all users in this association.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatesAndAccessCard;
