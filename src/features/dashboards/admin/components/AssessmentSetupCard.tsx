import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AssessmentRules } from "../types";
import { UnitOccupancyModal } from "./UnitOccupancyModal";

export interface AssessmentSetupCardProps {
  rules: AssessmentRules;
  currencySymbol: string;
  associationId?: string | number;
  onChange: (updated: Partial<AssessmentRules>) => void;
  onOccupancyChanged: () => void;
}

export const AssessmentSetupCard: React.FC<AssessmentSetupCardProps> = ({
  rules,
  currencySymbol,
  associationId,
  onChange,
  onOccupancyChanged,
}) => {
  const [isOccupancyModalOpen, setIsOccupancyModalOpen] = useState(false);
  const hasAssociationId = Boolean(associationId && String(associationId) !== "ALL");
  return (
    <>
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

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Rate by unit occupancy
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Apply different dues to owner-occupied and rented units. Units without a configured rate keep the default amount.
                </p>
              </div>
              <Switch
                checked={rules.is_advanced_enabled}
                onCheckedChange={(checked) =>
                  onChange({ is_advanced_enabled: Boolean(checked) })
                }
              />
            </div>

            {rules.is_advanced_enabled && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Owner-occupied amount ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rules.owner_occupied_amount ?? ""}
                    onChange={(e) =>
                      onChange({
                        owner_occupied_amount: e.target.value === "" ? null : parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Rented amount ({currencySymbol})
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={rules.rented_amount ?? ""}
                    onChange={(e) =>
                      onChange({
                        rented_amount: e.target.value === "" ? null : parseFloat(e.target.value),
                      })
                    }
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-white"
                  />
                </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!hasAssociationId}
                    onClick={() => setIsOccupancyModalOpen(true)}
                  >
                    <SlidersHorizontal size={15} /> Manage Unit Occupancy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    <UnitOccupancyModal
      associationId={associationId}
      isOpen={isOccupancyModalOpen}
      onClose={() => setIsOccupancyModalOpen(false)}
      onChanged={onOccupancyChanged}
    />
    </>
  );
};

export default AssessmentSetupCard;
