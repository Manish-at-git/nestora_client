import React, { useMemo } from "react";
import { MapPin, Plus, Star } from "lucide-react";
import { DataTable, TableRowActions } from "@/components/common";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/common/DataTable";
import type { NearbyPlace } from "../types";

interface NearbyPlacesTableProps {
  places: NearbyPlace[];
  isLoading: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onAdd: () => void;
  onEdit: (place: NearbyPlace) => void;
  onDelete: (place: NearbyPlace) => void;
}

export const NearbyPlacesTable: React.FC<NearbyPlacesTableProps> = (props) => {
  const columns = useMemo<Column<NearbyPlace>[]>(
    () => [
      {
        key: "name",
        header: "Place / Service",
        sortable: true,
        render: (place) => (
          <div>
            <p className="font-semibold text-slate-800">{place.name}</p>
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              {place.tags || "No tags"}
            </p>
          </div>
        ),
      },
      {
        key: "category",
        header: "Category",
        sortable: true,
        render: (place) => (
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold uppercase text-indigo-700">
            {place.category}
          </span>
        ),
      },
      {
        key: "distance",
        header: "Distance & Hours",
        render: (place) => (
          <div className="text-xs">
            <p className="font-medium text-slate-700">{place.distance}</p>
            <p className="mt-0.5 text-slate-500">{place.status}</p>
          </div>
        ),
      },
      {
        key: "rating",
        header: "Rating",
        sortable: true,
        render: (place) => (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <Star size={14} className="fill-amber-500" />
            {place.rating} ({place.reviews})
          </span>
        ),
      },
      {
        key: "is_active",
        header: "Status",
        render: (place) => (
          <span
            className={
              place.is_active
                ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
            }
          >
            {place.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "w-28",
        render: (place) => (
          <TableRowActions
            onEdit={() => props.onEdit(place)}
            onDelete={() => props.onDelete(place)}
            canEdit={props.canUpdate}
            canDelete={props.canDelete}
            reserveEditSlot
            reserveDeleteSlot
          />
        ),
      },
    ],
    [props],
  );
  return (
    <DataTable
      data={props.places}
      columns={columns}
      isLoading={props.isLoading}
      searchPlaceholder="Search nearby places..."
      searchKeys={["name", "category", "address", "tags"]}
      emptyTitle="No nearby places"
      emptyMessage="Add the first nearby place or service to the catalogue."
    />
  );
};
