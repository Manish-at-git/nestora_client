import React from "react";
import { Input } from "@/components/ui/input";

export interface PropertyFloor {
  id: string;
  name: string;
  unit_count: string;
}

export interface PropertyBlock {
  id: string;
  name: string;
  unit_count?: string;
  floors?: PropertyFloor[];
}

export interface PropertyStructure {
  blocks: PropertyBlock[];
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const createPropertyStructure = (isCondominium: boolean): PropertyStructure => ({
  blocks: [
    isCondominium
      ? { id: newId(), name: "", floors: [{ id: newId(), name: "", unit_count: "" }] }
      : { id: newId(), name: "", unit_count: "" },
  ],
});

interface PropertyStructureEditorProps {
  value: PropertyStructure;
  isCondominium: boolean;
  error?: string;
}

interface PropertyStructureRow {
  id: string;
  block: string;
  floor?: string;
  unitCount: string;
}

export const PropertyStructureEditor: React.FC<PropertyStructureEditorProps> = ({
  value,
  isCondominium,
  error,
}) => {
  const rows: PropertyStructureRow[] = value.blocks.flatMap((block) => {
    if (!isCondominium) {
      return [{ id: block.id, block: block.name, unitCount: block.unit_count || "" }];
    }

    return (block.floors || []).map((floor) => ({
      id: floor.id,
      block: block.name,
      floor: floor.name,
      unitCount: floor.unit_count,
    }));
  });
  const countLabel = isCondominium ? "Units" : "Homes";
  const gridColumns = isCondominium ? "grid-cols-3" : "grid-cols-2";

  return (
    <section className="space-y-2 pt-1" aria-label="Property structure">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Property Structure</h3>
        <p className="text-xs text-slate-500">
          This preview comes from the Unit Details sheet. Edit the workbook, then upload it again to update it.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80">
        <div className={`grid ${gridColumns} gap-2 border-b border-slate-200 bg-slate-100/80 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500`}>
          <span>Block</span>
          {isCondominium && <span>Floor</span>}
          <span>No. of {countLabel}</span>
        </div>
        <div className="divide-y divide-slate-200">
          {rows.map((row) => (
            <div key={row.id} className={`grid ${gridColumns} items-center gap-2 px-2.5 py-1.5`}>
              <Input aria-label="Block" value={row.block} readOnly className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />
              {isCondominium && <Input aria-label="Floor" value={row.floor || ""} readOnly className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />}
              <Input aria-label={countLabel} value={row.unitCount} readOnly className="h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0" />
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </section>
  );
};
