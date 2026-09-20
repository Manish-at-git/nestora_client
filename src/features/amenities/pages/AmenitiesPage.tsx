import React, { useState, useMemo } from "react";
import { Plus, Search, Coffee, Calendar, Building } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { useAppSelector } from "@/app/hooks";
import { ROLE_CODE } from "@/constants/roleCodes";
import {
  useGetAmenitiesQuery,
  useGetAdminAmenitiesQuery,
  useGetMyBookingsQuery,
  useGetAssociationBookingsQuery,
  useUpdateAmenityStatusMutation,
} from "../api/amenitiesApi";
import {
  AmenityCard,
  AmenityBookingModal,
  AddAmenityModal,
  MyBookingsTable,
  AssociationBookingsTable,
} from "../components";
import type { Amenity } from "../types";

export interface AmenitiesPageProps {
  selectedAssociationId?: string | number;
}

export const AmenitiesPage: React.FC<AmenitiesPageProps> = ({
  selectedAssociationId,
}) => {
  usePageHeader({
    title: "Amenities & Reservations",
    description: "Browse community facilities, check calendar slots, and make instant bookings.",
  });

  const { account } = useAuth();
  const { canView, canCreate, canUpdate, isLoading: isPermLoading } = usePermission("amenities");

  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );

  const effectiveAssociationId =
    selectedAssociationId && String(selectedAssociationId) !== "ALL"
      ? selectedAssociationId
      : account?.association_id
        ? account.association_id
        : globalActiveAssocId && globalActiveAssocId !== "ALL"
          ? globalActiveAssocId
          : undefined;

  const userRole = account?.role_code;
  const userIsAdmin = userRole === ROLE_CODE.SUPER_ADMIN || userRole === ROLE_CODE.ADMIN;
  const userIsBoard = userRole === ROLE_CODE.BOARD_MEMBER;
  const canAddAmenity = canCreate;

  const currencySymbol =
    (account?.association_country || "").toLowerCase() === "india" ? "₹" : "$";

  // Tab State
  const [activeTab, setActiveTab] = useState<string>(userIsAdmin ? "association_bookings" : "amenities");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [isBookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedAmenityForBooking, setSelectedAmenityForBooking] = useState<Amenity | null>(null);
  const [isAddAmenityOpen, setAddAmenityOpen] = useState<boolean>(false);

  // Queries
  const {
    data: residentAmenities = [],
    isLoading: isResidentLoading,
    refetch: refetchResidentAmenities,
  } = useGetAmenitiesQuery(effectiveAssociationId, {
    skip: !canView || userIsAdmin || !effectiveAssociationId,
  });

  const {
    data: adminAmenities = [],
    isLoading: isAdminAmenitiesLoading,
    refetch: refetchAdminAmenities,
  } = useGetAdminAmenitiesQuery(effectiveAssociationId, {
    skip: !canView || !userIsAdmin || !effectiveAssociationId,
  });

  const {
    data: myBookings = [],
    isLoading: isMyBookingsLoading,
    refetch: refetchMyBookings,
  } = useGetMyBookingsQuery(undefined, {
    skip: !canView || userIsAdmin,
  });

  const {
    data: associationBookings = [],
    isLoading: isAssocBookingsLoading,
    refetch: refetchAssocBookings,
  } = useGetAssociationBookingsQuery(effectiveAssociationId, {
    skip: !canView || (!userIsBoard && !userIsAdmin),
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAmenityStatusMutation();

  const allAmenities = userIsAdmin ? adminAmenities : residentAmenities;
  const isAmenitiesLoading = userIsAdmin ? isAdminAmenitiesLoading : isResidentLoading;

  // Filter amenities by search query
  const filteredAmenities = useMemo(() => {
    return allAmenities.filter((a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [allAmenities, searchQuery]);

  // Handlers
  const handleOpenBooking = (amenity: Amenity) => {
    setSelectedAmenityForBooking(amenity);
    setBookingModalOpen(true);
  };

  const handleToggleStatus = async (amenity: Amenity) => {
    if (!effectiveAssociationId) return;
    try {
      const currentStatus = Boolean(amenity.status);
      const res = await updateStatus({
        associationId: effectiveAssociationId,
        amenityId: amenity.id,
        status: !currentStatus,
      }).unwrap();

      if (res.ok) {
        toast.success(`Amenity marked as ${!currentStatus ? "Active" : "Inactive"}.`);
      }
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.data || "Failed to update amenity status.");
    }
  };

  const handleBookingSuccess = () => {
    refetchMyBookings();
    if (userIsBoard || userIsAdmin) {
      refetchAssocBookings();
    }
  };

  if (isPermLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!canView) {
    return (
      <AccessRestricted
        title="Amenities Access Restricted"
        description="Your role does not currently have permission to access the Amenities module. Please contact your association administrator."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs Layout with Search and Add Amenity Button in the header bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-100/80 p-1 rounded-xl">
            {!userIsAdmin && (
              <TabsTrigger value="amenities" className="rounded-lg text-xs font-medium px-4 py-1.5">
                Available Amenities ({filteredAmenities.length})
              </TabsTrigger>
            )}

            {!userIsAdmin && (
              <TabsTrigger value="my_bookings" className="rounded-lg text-xs font-medium px-4 py-1.5">
                My Bookings ({myBookings.length})
              </TabsTrigger>
            )}

            {(userIsBoard || userIsAdmin) && (
              <TabsTrigger value="association_bookings" className="rounded-lg text-xs font-medium px-4 py-1.5">
                {userIsAdmin ? "All Bookings" : "Association Bookings"} ({associationBookings.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Search bar + Add Amenity button placed side-by-side */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === "amenities" && (
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <Input
                  placeholder="Search amenities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {canAddAmenity && (
              <Button
                onClick={() => setAddAmenityOpen(true)}
              >
                <Plus size={15} />
                Add Amenity
              </Button>
            )}
          </div>
        </div>

        {/* TAB 1: Available Amenities */}
        <TabsContent value="amenities" className="focus-visible:outline-none">
          {isAmenitiesLoading ? (
            <div className="py-16 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredAmenities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAmenities.map((amenity) => (
                <AmenityCard
                  key={amenity.id}
                  amenity={amenity}
                  currencySymbol={currencySymbol}
                  onBook={handleOpenBooking}
                  canBook={!userIsAdmin}
                  isAdmin={userIsAdmin || canUpdate}
                  onToggleStatus={handleToggleStatus}
                  isToggling={isUpdatingStatus}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={searchQuery ? "No matching amenities found" : "No Amenities Available"}
              description={
                searchQuery
                  ? "Try adjusting your search criteria or clear the query filter."
                  : "There are currently no active amenities available for booking."
              }
              icon={Coffee}
              action={
                canAddAmenity && !searchQuery
                  ? {
                    label: "Add Amenity",
                    onClick: () => setAddAmenityOpen(true),
                  }
                  : undefined
              }
            />
          )}
        </TabsContent>

        {/* TAB 2: My Bookings */}
        {!userIsAdmin && (
          <TabsContent value="my_bookings" className="focus-visible:outline-none">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <MyBookingsTable
                bookings={myBookings}
                isLoading={isMyBookingsLoading}
                currencySymbol={currencySymbol}
              />
            </div>
          </TabsContent>
        )}

        {/* TAB 3: Association Bookings */}
        {(userIsBoard || userIsAdmin) && (
          <TabsContent value="association_bookings" className="focus-visible:outline-none">
            <div className="bg-white rounded-2xl shadow-xs">
              <AssociationBookingsTable
                bookings={associationBookings}
                isLoading={isAssocBookingsLoading}
                currencySymbol={currencySymbol}
                showAssociationColumn={userIsAdmin && !effectiveAssociationId}
              />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Booking Flow Modal */}
      <AmenityBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setSelectedAmenityForBooking(null);
        }}
        amenity={selectedAmenityForBooking}
        currencySymbol={currencySymbol}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* In-Feature Add Amenity Modal (Admin / Authorized Board only) */}
      {canAddAmenity && (
        <AddAmenityModal
          isOpen={isAddAmenityOpen}
          onClose={() => {
            setAddAmenityOpen(false);
            if (userIsAdmin) refetchAdminAmenities();
            else refetchResidentAmenities();
          }}
          associationId={effectiveAssociationId}
          currencySymbol={currencySymbol}
        />
      )}
    </div>
  );
};

export default AmenitiesPage;
