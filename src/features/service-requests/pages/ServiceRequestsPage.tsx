import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Wrench, Building2, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import { usePermission } from "@/hooks/usePermission";
import { AccessRestricted, EmptyState, LoadingSpinner } from "@/components/common";
import { isAdmin, isSuperAdmin, isHomeowner } from "@/lib/utils";
import { useAppSelector } from "@/app/hooks";
import { useGetAdminAssociationsQuery } from "@/services/api/associationsApi";
import {
  useGetServiceRequestsQuery,
  useGetServiceRequestByIdQuery,
  useUpdateServiceRequestStatusMutation,
} from "../api/serviceRequestsApi";
import {
  SERVICE_STATUS_TABS,
  STATUS_API_VALUES,
  STATUS_BADGE_CONFIG,
  normalizeServiceStatus,
  type ServiceStatusKey,
  type ServiceStatusTabKey,
} from "../constants";
import {
  ServiceRequestCard,
  ServiceRequestFormModal,
  ServiceRequestDetailView,
  ServiceRequestMappingModal,
} from "../components";
import type { ServiceRequest } from "../types";

export interface ServiceRequestsPageProps {
  selectedAssociationId?: string | number;
  adminAssociations?: Array<{ id: string | number; name: string }>;
}

export const ServiceRequestsPage: React.FC<ServiceRequestsPageProps> = ({
  selectedAssociationId,
  adminAssociations = [],
}) => {
  const { requestId } = useParams<{ requestId?: string }>();
  const navigate = useNavigate();

  usePageHeader({
    title: requestId ? "Service Request Details" : "Service Requests",
    description: requestId
      ? "View request specifics, track status, and participate in discussion."
      : "Track, manage, and resolve maintenance tickets, repairs, and service orders.",
  });

  const { account } = useAuth();
  const { canCreate, canView, isLoading: isPermLoading } =
    usePermission("service_requests");

  const [activeTab, setActiveTab] = useState<ServiceStatusTabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isMapModalOpen, setMapModalOpen] = useState(false);
  const [requestToMap, setRequestToMap] = useState<ServiceRequest | null>(null);

  // Redux association selection
  const globalActiveAssocId = useAppSelector(
    (state) => state.ui.activeAssociationId
  );

  const userRole = account?.role_code;
  const userIsAdmin = isAdmin(userRole) || isSuperAdmin(userRole);
  const canManageStatus = userIsAdmin;

  // Fallback load admin associations
  const { data: fetchedAssocs = [], isFetching: isAssocsLoading } =
    useGetAdminAssociationsQuery(undefined, {
      skip: adminAssociations.length > 0 || !userIsAdmin,
    });

  const effectiveAdminAssociations = useMemo(() => {
    if (adminAssociations && adminAssociations.length > 0) {
      return adminAssociations;
    }
    return fetchedAssocs;
  }, [adminAssociations, fetchedAssocs]);

  const [filterAssocId, setFilterAssocId] = useState<string>("");

  const effectiveAssociationId =
    filterAssocId && filterAssocId !== "ALL"
      ? filterAssocId
      : selectedAssociationId && String(selectedAssociationId) !== "ALL"
      ? selectedAssociationId
      : globalActiveAssocId && globalActiveAssocId !== "ALL"
      ? globalActiveAssocId
      : undefined;

  // Query service requests list
  const {
    data: requests = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetServiceRequestsQuery(
    effectiveAssociationId ? { association_id: effectiveAssociationId } : undefined,
    { skip: !canView && !userIsAdmin && !isHomeowner(userRole) }
  );

  // Query single request if requestId is present in URL
  const {
    data: singleRequest,
    isLoading: isSingleLoading,
    refetch: refetchSingle,
  } = useGetServiceRequestByIdQuery(requestId!, {
    skip: !requestId,
  });

  const [updateStatus] = useUpdateServiceRequestStatusMutation();

  const handleUpdateStatus = async (
    reqId: string | number,
    newStatusKey: ServiceStatusKey
  ) => {
    const apiStatus = STATUS_API_VALUES[newStatusKey];
    try {
      const res = await updateStatus({ id: reqId, status: apiStatus }).unwrap();
      if (res.ok) {
        toast.success(`Request marked as ${STATUS_BADGE_CONFIG[newStatusKey].label}`);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  // Filter requests by Tab & Search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const statusKey = normalizeServiceStatus(req.status);

      // Tab status filter
      if (activeTab !== "all" && statusKey !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = req.sr_display_id?.toLowerCase().includes(query);
        const matchesType = req.service_type?.toLowerCase().includes(query);
        const matchesSubcat = req.sub_category?.toLowerCase().includes(query);
        const matchesTitle = req.custom_title?.toLowerCase().includes(query);
        const matchesDesc = req.description?.toLowerCase().includes(query);
        const matchesName = req.requestor_name?.toLowerCase().includes(query);
        const matchesUnit = req.unit_number?.toLowerCase().includes(query);

        return (
          matchesId ||
          matchesType ||
          matchesSubcat ||
          matchesTitle ||
          matchesDesc ||
          matchesName ||
          matchesUnit
        );
      }

      return true;
    });
  }, [requests, activeTab, searchQuery]);

  // Counts by tab using normalized lowercase keys
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: requests.length,
      new: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
    };
    requests.forEach((r) => {
      const statusKey = normalizeServiceStatus(r.status);
      res[statusKey] = (res[statusKey] || 0) + 1;
    });
    return res;
  }, [requests]);

  const assocOptions = useMemo(() => {
    const opts = effectiveAdminAssociations
      .filter((a) => String(a.id) !== "ALL")
      .map((a) => ({
        value: String(a.id),
        label: a.name,
      }));
    return [{ value: "", label: "All Associations" }, ...opts];
  }, [effectiveAdminAssociations]);

  if (!isPermLoading && !canView && !userIsAdmin && !isHomeowner(userRole)) {
    return <AccessRestricted moduleName="service_requests" />;
  }

  // If requestId route parameter is present, render the dedicated Detail View
  if (requestId) {
    if (isLoading || isSingleLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
          <LoadingSpinner text="Loading service request details..." />
        </div>
      );
    }

    const activeRequest =
      singleRequest || requests.find((r) => String(r.id) === String(requestId));

    if (!activeRequest) {
      return (
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/service-requests")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Service Requests
          </Button>
          <EmptyState
            icon={<Wrench size={36} className="text-slate-400" />}
            title="Service Request Not Found"
            description="The service request you are looking for does not exist or you do not have permission to view it."
            action={{
              label: "View All Requests",
              onClick: () => navigate("/service-requests"),
            }}
          />
        </div>
      );
    }

    return (
      <div className="animate-in fade-in duration-200">
        <ServiceRequestDetailView
          request={activeRequest}
          onBack={() => {
            navigate("/service-requests");
            refetch();
          }}
          onStatusChange={() => {
            refetch();
            refetchSingle?.();
          }}
          onOpenMapModal={() => {
            setRequestToMap(activeRequest);
            setMapModalOpen(true);
          }}
          canManageStatus={canManageStatus}
          userIsAdmin={userIsAdmin}
        />

        <ServiceRequestMappingModal
          isOpen={isMapModalOpen}
          onClose={() => {
            setMapModalOpen(false);
            setRequestToMap(null);
          }}
          request={requestToMap}
          onSuccess={() => {
            refetch();
            refetchSingle?.();
          }}
          adminAssociations={effectiveAdminAssociations}
        />
      </div>
    );
  }

  // Default List View
  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Status Tabs & Search & Add Button */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as ServiceStatusTabKey)}
          >
            <TabsList className="h-10 bg-slate-100 p-1 dark:bg-slate-800">
              {SERVICE_STATUS_TABS.map((tab) => {
                const count = counts[tab.key] ?? 0;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{tab.label}</span>
                    <span className="rounded-full bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.2 text-[10px] text-slate-600 dark:text-slate-300">
                      {count}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        {/* Search Input & Association Dropdown & Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <Input
              type="text"
              placeholder="Search ID, title, resident..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pr-3 text-xs"
            />
          </div>

          {userIsAdmin && assocOptions.length > 1 && (
            <div className="w-full sm:w-48">
              <Select
                value={filterAssocId}
                onChange={(e) => setFilterAssocId(e.target.value)}
                options={assocOptions}
                className="h-9 text-xs"
              />
            </div>
          )}

          {(canCreate || userIsAdmin || isHomeowner(userRole)) && (
            <Button
              onClick={() => setFormModalOpen(true)}
              className="h-9 gap-1.5 px-3.5 text-xs font-semibold bg-moss hover:bg-moss/90 text-white w-full sm:w-auto shrink-0"
            >
              <Plus size={15} />
              <span>New Request</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner text="Loading service requests..." />
        </div>
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={<Wrench size={40} className="text-slate-400" />}
          title={
            searchQuery
              ? "No matching requests found"
              : activeTab !== "all"
              ? `No requests in '${activeTab}' status`
              : "No service requests yet"
          }
          description={
            searchQuery
              ? `No tickets match "${searchQuery}". Try clearing search or changing filters.`
              : "Create a new ticket to request maintenance or repairs for your property."
          }
          action={
            canCreate || userIsAdmin || isHomeowner(userRole)
              ? {
                  label: "Create Service Request",
                  onClick: () => setFormModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        /* Requests Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => (
            <ServiceRequestCard
              key={req.id}
              request={req}
              onClick={() => navigate(`/service-requests/${req.id}`)}
              onUpdateStatus={(newStatus) => handleUpdateStatus(req.id, newStatus)}
              onOpenMapModal={() => {
                setRequestToMap(req);
                setMapModalOpen(true);
              }}
              canManageStatus={canManageStatus}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      <ServiceRequestFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={() => refetch()}
        adminAssociations={effectiveAdminAssociations}
        selectedAssociationId={effectiveAssociationId}
      />

      {/* Map Unassigned Request Modal */}
      <ServiceRequestMappingModal
        isOpen={isMapModalOpen}
        onClose={() => {
          setMapModalOpen(false);
          setRequestToMap(null);
        }}
        request={requestToMap}
        onSuccess={() => {
          refetch();
        }}
        adminAssociations={effectiveAdminAssociations}
      />
    </div>
  );
};

export default ServiceRequestsPage;
