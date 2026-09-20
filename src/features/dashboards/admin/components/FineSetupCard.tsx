import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FineRule } from "../types";

export interface FineSetupCardProps {
  fineRules: FineRule[];
  currencySymbol: string;
  onAddFine: (newFine: FineRule) => void;
  onRemoveFine: (index: number) => void;
}

export const FineSetupCard: React.FC<FineSetupCardProps> = ({
  fineRules,
  currencySymbol,
  onAddFine,
  onRemoveFine,
}) => {
  const [newFine, setNewFine] = useState<FineRule>({
    fine_type: "",
    amount: 0,
    grace_period_days: 0,
  });

  const handleAdd = () => {
    if (!newFine.fine_type.trim()) {
      toast.error("Please enter a fine type.");
      return;
    }
    onAddFine({ ...newFine });
    setNewFine({ fine_type: "", amount: 0, grace_period_days: 0 });
  };

  return (
    <Card className="border border-slate-200 rounded-2xl bg-white shadow-xs">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-3">
          Fine Setup
        </h3>

        {/* Inline Add Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Fine Type (e.g. Late Fee)
            </label>
            <Input
              type="text"
              value={newFine.fine_type}
              onChange={(e) => setNewFine({ ...newFine, fine_type: e.target.value })}
              placeholder="Late Payment Fee"
              className="w-full h-10 border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="w-full md:w-36">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Amount ({currencySymbol})
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={newFine.amount}
              onChange={(e) =>
                setNewFine({ ...newFine, amount: parseFloat(e.target.value) || 0 })
              }
              className="w-full h-10 border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="w-full md:w-36">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Grace Period
            </label>
            <Input
              type="number"
              min="0"
              value={newFine.grace_period_days}
              onChange={(e) =>
                setNewFine({
                  ...newFine,
                  grace_period_days: parseInt(e.target.value, 10) || 0,
                })
              }
              placeholder="Days"
              className="w-full h-10 border-slate-200 rounded-xl text-sm"
            />
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            className="h-10 px-6 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium cursor-pointer"
          >
            Add
          </Button>
        </div>

        {/* Fines Table */}
        {fineRules.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-medium">
                <tr>
                  <th className="px-5 py-3.5">Fine Type</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Grace Period (Days)</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fineRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {rule.fine_type}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {currencySymbol}
                      {parseFloat(String(rule.amount || 0)).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {rule.grace_period_days}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        type="button"
                        onClick={() => onRemoveFine(idx)}
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0 text-xs font-semibold text-red-500 hover:bg-transparent hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic py-2">No fine rules defined.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FineSetupCard;
