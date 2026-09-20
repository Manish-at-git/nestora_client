import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AssessmentRules } from "../types";

export interface AssessmentSetupCardProps {
  rules: AssessmentRules;
  currencySymbol: string;
  onChange: (updated: Partial<AssessmentRules>) => void;
}

export const AssessmentSetupCard: React.FC<AssessmentSetupCardProps> = ({
  rules,
  currencySymbol,
  onChange,
}) => {
  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
          Assessment Setup
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Frequency
            </label>
            <Select
              value={rules.frequency || "Monthly"}
              onValueChange={(value) => onChange({ frequency: value })}
              options={[
                { value: "Monthly", label: "Monthly" },
                { value: "Quarterly", label: "Quarterly" },
                { value: "Annually", label: "Annually" },
              ]}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Default Amount ({currencySymbol})
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={rules.default_amount}
                onChange={(e) =>
                  onChange({ default_amount: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Due Day of Month
              </label>
              <Input
                type="number"
                min="1"
                max="31"
                value={rules.due_day_of_month}
                onChange={(e) =>
                  onChange({ due_day_of_month: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentSetupCard;
