import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusPill } from "@/components/common/StatusPill";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useGetFeaturesQuery } from "@/features/features/api/featuresApi";
import { cn } from "@/lib/utils";

export interface PlanFeaturesSelectorProps {
  selectedFeatureIds: string[];
  onChange: (featureIds: string[]) => void;
  disabled?: boolean;
}

export const PlanFeaturesSelector: React.FC<PlanFeaturesSelectorProps> = ({
  selectedFeatureIds,
  onChange,
  disabled = false,
}) => {
  const { data: features = [], isLoading } = useGetFeaturesQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const activeFeatures = useMemo(
    () => features.filter((f) => Boolean(f.is_active)),
    [features]
  );

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return activeFeatures;
    const term = searchTerm.toLowerCase();
    return activeFeatures.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        (f.description && f.description.toLowerCase().includes(term)) ||
        (f.parent_name && f.parent_name.toLowerCase().includes(term))
    );
  }, [activeFeatures, searchTerm]);

  const handleToggleFeature = (id: string) => {
    if (disabled) return;
    if (selectedFeatureIds.includes(id)) {
      onChange(selectedFeatureIds.filter((fid) => fid !== id));
    } else {
      onChange([...selectedFeatureIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allActiveIds = activeFeatures.map((f) => f.id);
    onChange(allActiveIds);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={disabled}
            leftIcon={<Search size={14} className="text-slate-400" />}
            className="h-9 text-xs bg-slate-50/70 border-slate-200 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Select All ({activeFeatures.length})
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={disabled}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Clear ({selectedFeatureIds.length} selected)
          </button>
        </div>
      </div>

      {/* Feature Grid / List */}
      <div className="max-h-56 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredFeatures.length === 0 ? (
          <div className="col-span-2 py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
            No matching features found
          </div>
        ) : (
          filteredFeatures.map((feat) => {
            const isSelected = selectedFeatureIds.includes(feat.id);

            return (
              <div
                key={feat.id}
                onClick={() => handleToggleFeature(feat.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all h-10",
                  isSelected
                    ? "bg-blue-50/50 border-blue-200 text-slate-900 ring-1 ring-blue-500/20 shadow-2xs"
                    : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleToggleFeature(feat.id)}
                  disabled={disabled}
                  size="sm"
                  variant="primary"
                  className="pointer-events-none shrink-0"
                />
                <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5">
                  <span className="font-medium text-xs text-slate-900 truncate">
                    {feat.name}
                  </span>
                  {feat.parent_name && (
                    <StatusPill variant="indigo" shape="rounded" size="xs">
                      {feat.parent_name}
                    </StatusPill>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlanFeaturesSelector;
