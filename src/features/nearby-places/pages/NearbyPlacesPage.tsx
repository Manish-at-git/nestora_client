import React, { useMemo, useState } from "react";
import {
  LayoutGrid,
  Map,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  ShieldAlert,
} from "lucide-react";
import { AccessRestricted, ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FEATURES } from "@/constants/featureCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { toast } from "sonner";
import {
  useDeleteNearbyPlaceMutation,
  useGetNearbyPlacesForAdminQuery,
  useGetNearbyPlacesQuery,
} from "../api";
import {
  NearbyPlaceCard,
  NearbyPlaceFormModal,
  NearbyPlacesTable,
} from "../components";
import { NEARBY_CATEGORIES, NEARBY_EMERGENCY_CONTACTS } from "../constants";
import type { NearbyPlace } from "../types";

export const NearbyPlacesPage: React.FC = () => {
  const permission = usePermission(FEATURES.NEARBY_PLACES.FEATURE_CODE);
  const canView = permission.canView || permission.isSuperAdmin;
  const canManage =
    permission.canCreate ||
    permission.canUpdate ||
    permission.canDelete ||
    permission.isSuperAdmin;
  const { data: activePlaces = [] } = useGetNearbyPlacesQuery(undefined, {
    skip: !canView,
  });
  const { data: adminPlaces = [], isLoading: isAdminLoading } =
    useGetNearbyPlacesForAdminQuery(undefined, { skip: !canManage });
  const [deletePlace, { isLoading: isDeleting }] =
    useDeleteNearbyPlaceMutation();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [catalogueView, setCatalogueView] = useState<"cards" | "map" | "table">(
    "cards",
  );
  const [placeToEdit, setPlaceToEdit] = useState<NearbyPlace | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [placeToDelete, setPlaceToDelete] = useState<NearbyPlace | null>(null);

  usePageHeader({
    title: FEATURES.NEARBY_PLACES.FEATURE_LABEL,
    description:
      "Explore local services, community events, and emergency contacts near your association.",
  });

  const places = activePlaces;
  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        const haystack = [place.name, place.address, place.tags || ""]
          .join(" ")
          .toLowerCase();
        return (
          (category === "all" || place.category === category) &&
          haystack.includes(search.toLowerCase())
        );
      }),
    [places, category, search],
  );

  const openCreate = () => {
    setPlaceToEdit(null);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setPlaceToEdit(null);
  };
  const confirmDelete = async () => {
    if (!placeToDelete) return;
    try {
      await deletePlace(placeToDelete.id).unwrap();
      toast.success("Nearby place deleted successfully");
      setPlaceToDelete(null);
    } catch (error: any) {
      toast.error(
        error?.data || error?.message || "Failed to delete nearby place",
      );
    }
  };

  if (!permission.isLoading && !canView)
    return (
      <AccessRestricted
        moduleName={FEATURES.NEARBY_PLACES.FEATURE_LABEL}
        showAction
      />
    );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          {/* <div>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ShieldAlert size={16} className="text-rose-500" />
              Emergency Direct Contacts
            </h2>
          </div> */}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {NEARBY_EMERGENCY_CONTACTS.map((contact) => (
            <a
              key={contact.name}
              href={`tel:${contact.number}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
            >
              <p className="text-sm font-semibold text-slate-800">
                {contact.name}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {contact.subtitle}
              </p>
              <p className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-700">
                <Phone size={13} />
                {contact.number}
              </p>
            </a>
          ))}
        </div>
      </section>

      <div className="flex justify-between">
        <Tabs
          value={catalogueView}
          onValueChange={(value) => {
            const nextView = value as "cards" | "map" | "table";
            setCatalogueView(nextView);
          }}
        >
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="map">Map summary</TabsTrigger>
            {canManage ? (
              <TabsTrigger value="table">Catalogue Table</TabsTrigger>
            ) : null}
          </TabsList>
        </Tabs>
        <div>
            {permission.canCreate || permission.isSuperAdmin ? (
            <Button onClick={openCreate}>
              <Plus size={16} />
              Add Place
            </Button>
          ) : null}
        </div>
      </div>

      {catalogueView !== "table" ? (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                leftIcon={<Search size={16} />}
                placeholder="Search places, services, or tags..."
                isClearable
                onClear={() => setSearch("")}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {NEARBY_CATEGORIES.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={category === item.value ? "default" : "outline"}
                onClick={() => setCategory(item.value)}
                className="shrink-0"
              >
                {item.label}
              </Button>
            ))}
          </div>
          {catalogueView === "map" ? (
            <div className="rounded-2xl bg-slate-900 p-8 text-center text-white">
              <Navigation size={30} className="mx-auto mb-3 text-indigo-300" />
              <h2 className="text-lg font-semibold">Interactive Radius Map</h2>
              <p className="mt-1 text-sm text-slate-300">
                Showing {filteredPlaces.length} places within the configured
                community radius.
              </p>
              <div className="mx-auto mt-5 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredPlaces.slice(0, 4).map((place) => (
                  <div
                    key={place.id}
                    className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-left"
                  >
                    <p className="truncate text-sm font-semibold">
                      {place.name}
                    </p>
                    <p className="mt-1 text-xs text-indigo-300">
                      {place.distance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredPlaces.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPlaces.map((place) => (
                <NearbyPlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="py-14 text-center text-sm text-slate-500">
              <MapPin size={32} className="mx-auto mb-3 text-slate-300" />
              No nearby places match the current search.
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <NearbyPlacesTable
            places={adminPlaces}
            isLoading={isAdminLoading}
            canCreate={permission.canCreate || permission.isSuperAdmin}
            canUpdate={permission.canUpdate || permission.isSuperAdmin}
            canDelete={permission.canDelete || permission.isSuperAdmin}
            onAdd={openCreate}
            onEdit={(place) => {
              setPlaceToEdit(place);
              setFormOpen(true);
            }}
            onDelete={setPlaceToDelete}
          />
        </section>
      )}
      <NearbyPlaceFormModal
        isOpen={isFormOpen}
        onClose={closeForm}
        placeToEdit={placeToEdit}
      />
      <ConfirmDialog
        isOpen={Boolean(placeToDelete)}
        title="Delete Nearby Place"
        description={`Delete "${placeToDelete?.name || "this place"}" from the global catalogue? This action cannot be undone.`}
        confirmText="Delete Place"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setPlaceToDelete(null)}
      />
    </div>
  );
};

export default NearbyPlacesPage;
