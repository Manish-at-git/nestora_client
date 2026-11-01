import React, { useEffect, useMemo, useState } from "react";
import { Building2, Home, KeyRound, Search, X } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api/apiClient";
import { Button } from "@/components/ui/button";

interface OccupancyUnit {
  id: string;
  unit_number: string;
  block_name?: string | null;
  is_rented: boolean;
}

interface UnitOccupancyModalProps {
  associationId?: string | number;
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
}

export const UnitOccupancyModal: React.FC<UnitOccupancyModalProps> = ({
  associationId,
  isOpen,
  onClose,
  onChanged,
}) => {
  const [units, setUnits] = useState<OccupancyUnit[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !associationId || String(associationId) === "ALL") return;
    const load = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(
          `/admin/associations/${associationId}/occupancy-units`,
        );
        setUnits(response.data?.data || []);
      } catch {
        toast.error("Unable to load association units.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [associationId, isOpen]);

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return units;
    return units.filter((unit) =>
      `${unit.block_name || ""} ${unit.unit_number}`.toLowerCase().includes(query),
    );
  }, [search, units]);

  const ownerCount = units.filter((unit) => !unit.is_rented).length;
  const rentedCount = units.length - ownerCount;

  const toggleOccupancy = async (unit: OccupancyUnit) => {
    if (!associationId || String(associationId) === "ALL") {
      toast.error("Select an association before updating unit occupancy.");
      return;
    }
    try {
      setUpdatingUnitId(unit.id);
      await apiClient.put(
        `/admin/associations/${associationId}/occupancy-units/${unit.id}`,
        { is_rented: !unit.is_rented },
      );
      setUnits((current) =>
        current.map((candidate) =>
          candidate.id === unit.id
            ? { ...candidate, is_rented: !candidate.is_rented }
            : candidate,
        ),
      );
      onChanged();
      toast.success(
        `${unit.unit_number} is now ${unit.is_rented ? "owner-occupied" : "rented"}.`,
      );
    } catch {
      toast.error("Unable to update unit occupancy.");
    } finally {
      setUpdatingUnitId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="unit-occupancy-title"
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5">
          <div className="flex gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Building2 size={20} />
            </div>
            <div>
              <h2 id="unit-occupancy-title" className="font-semibold text-slate-900">
                Manage Unit Occupancy
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Set each unit as owner-occupied or rented for assessment calculation.
              </p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search unit or block"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-400"
            />
          </label>
          <div className="flex gap-2 text-xs font-medium">
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
              {ownerCount} Owner-occupied
            </span>
            <span className="rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
              {rentedCount} Rented
            </span>
          </div>
        </div>

        <div className="min-h-48 flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-slate-500">Loading units…</p>
          ) : filteredUnits.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">No units match your search.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredUnits.map((unit) => {
                const rented = Boolean(unit.is_rented);
                return (
                  <li key={unit.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`rounded-lg p-2 ${rented ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {rented ? <KeyRound size={16} /> : <Home size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          Unit {unit.unit_number}{unit.block_name ? ` · ${unit.block_name}` : ""}
                        </p>
                        <p className="text-xs text-slate-500">
                          {rented ? "Rented" : "Owner-occupied"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={updatingUnitId === unit.id}
                      onClick={() => void toggleOccupancy(unit)}
                    >
                      {updatingUnitId === unit.id
                        ? "Updating…"
                        : rented
                          ? "Set owner-occupied"
                          : "Set rented"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs text-slate-500">Changes apply to future dues calculations immediately.</p>
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>Done</Button>
        </div>
      </section>
    </div>
  );
};
