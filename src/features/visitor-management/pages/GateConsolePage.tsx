import React, { useState } from "react";
import { Search, Send, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AccessRestricted, FormField, FormModal, StatusPill } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isVisitorOperationsRole } from "@/constants/roleCodes";
import { useAuth } from "@/context/AuthContext";
import { usePageHeader } from "@/hooks/usePageHeader";
import {
  useCheckInWalkInVisitorMutation,
  useCreateWalkInRequestMutation,
  useGetSecurityGateRequestsQuery,
  useGetWalkInStatusQuery,
  useLazySearchResidentsQuery,
} from "../api";
import { VISITOR_TYPE_OPTIONS } from "../constants";
import { ActiveVisitorTable, GateRequestTable } from "../components";
import type { ResidentSearchResult } from "../types";

export const GateConsolePage: React.FC = () => {
  const { account } = useAuth();
  const isSecurity = isVisitorOperationsRole(account?.role_code);
  const [residentQuery, setResidentQuery] = useState("");
  const [selectedResident, setSelectedResident] = useState<ResidentSearchResult | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [mobile, setMobile] = useState("");
  const [visitorType, setVisitorType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [visitId, setVisitId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [searchResidents, residentSearch] = useLazySearchResidentsQuery();
  const [createRequest, createState] = useCreateWalkInRequestMutation();
  const [checkIn, checkInState] = useCheckInWalkInVisitorMutation();
  const gateRequestsQuery = useGetSecurityGateRequestsQuery(undefined, {
    skip: !isSecurity,
    pollingInterval: isSecurity ? 5000 : 0,
  });
  const statusQuery = useGetWalkInStatusQuery(visitId || "", {
    skip: !visitId,
    pollingInterval: visitId ? 5000 : 0,
  });
  const visitStatus = String(statusQuery.data?.status || "Pending");

  usePageHeader({
    title: "New Visitor",
    description: "View visitors inside and register a walk-in visitor when needed.",
  });

  if (!isSecurity) {
    return <AccessRestricted moduleName="New Visitor" showAction />;
  }

  const resetVisitorForm = () => {
    setResidentQuery("");
    residentSearch.reset();
    setSelectedResident(null);
    setVisitorName("");
    setMobile("");
    setVisitorType("");
    setPurpose("");
    setVehicleNumber("");
    setVisitId(null);
  };

  const closeCreateModal = () => {
    resetVisitorForm();
    setIsCreateOpen(false);
  };

  const findResidents = async () => {
    if (residentQuery.trim().length < 2) {
      toast.error("Enter at least two characters to search residents");
      return;
    }
    await searchResidents(residentQuery.trim());
  };

  const submitRequest = async () => {
    if (!selectedResident || !visitorName.trim() || mobile.length !== 10 || !visitorType || !purpose.trim()) {
      toast.error("Complete the visitor, destination, and purpose details");
      return;
    }
    try {
      const response = await createRequest({
        name: visitorName.trim(),
        mobile,
        visitor_type: visitorType,
        number_of_visitors: 1,
        unit_id: selectedResident.unit_id,
        purpose: purpose.trim(),
        vehicle_number: vehicleNumber.trim() || undefined,
      }).unwrap();
      if (response.id) {
        setVisitId(response.id);
        setActiveTab("requests");
        toast.success("Approval request sent to the resident");
      }
    } catch (error: any) {
      toast.error(error?.data?.detail || "Unable to send the visitor request");
    }
  };

  const confirmCheckIn = async () => {
    if (!visitId) return;
    try {
      await checkIn(visitId).unwrap();
      toast.success("Walk-in visitor checked in");
      closeCreateModal();
    } catch (error: any) {
      toast.error(error?.data?.detail || "Unable to check in this visitor");
    }
  };

  const isApprovalPending = Boolean(visitId) && !["Approved", "Denied"].includes(visitStatus);
  const submitText = visitId && visitStatus === "Approved"
    ? "Check In Visitor"
    : visitId && visitStatus === "Denied"
      ? "Start New Entry"
      : "Send Approval Request";

  const submitVisitor = async () => {
    if (visitId && visitStatus === "Approved") {
      await confirmCheckIn();
      return;
    }
    if (visitId && visitStatus === "Denied") {
      resetVisitorForm();
      return;
    }
    await submitRequest();
  };

  const residentResults = residentQuery.trim().length >= 2
    ? residentSearch.data?.residents || []
    : [];
  const activeGateRequestCount = (gateRequestsQuery.data?.requests || []).filter(
    (request) => request.status === "Pending" || request.status === "Approved",
  ).length;

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="active" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
              Active Visitors
            </TabsTrigger>
            <TabsTrigger value="requests" className="rounded-lg px-4 py-1.5 text-xs font-semibold">
              Gate Requests
              {activeGateRequestCount > 0 ? (
                <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {activeGateRequestCount}
                </span>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-0 focus-visible:outline-none">
          <ActiveVisitorTable onCreateVisitor={() => setIsCreateOpen(true)} />
        </TabsContent>

        <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
          <GateRequestTable
            requests={gateRequestsQuery.data?.requests || []}
            isLoading={gateRequestsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>

      <FormModal
        isOpen={isCreateOpen}
        onClose={closeCreateModal}
        onSubmit={submitVisitor}
        title="New Visitor"
        subtitle="Find the destination resident, then send a walk-in approval request."
        size="4xl"
        submitText={submitText}
        loadingText="Submitting..."
        submitIcon={!visitId ? <Send size={15} /> : undefined}
        submitDisabled={isApprovalPending}
        isSubmitting={createState.isLoading || checkInState.isLoading}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Walk-In Visitor Details</h2>
            <p className="text-xs text-slate-500">The selected resident receives the approval request.</p>
          </div>
          {visitId ? <StatusPill status={visitStatus}>{visitStatus}</StatusPill> : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <FormField label="Visitor's Destination" required>
              <div className="flex gap-2">
                <Input
                  value={residentQuery}
                  onChange={(event) => setResidentQuery(event.target.value)}
                  placeholder="Search resident or unit"
                  leftIcon={<Search size={15} />}
                  disabled={Boolean(visitId)}
                />
                <Button type="button" onClick={findResidents} disabled={residentSearch.isFetching || Boolean(visitId)}>
                  Search
                </Button>
              </div>
            </FormField>
            <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
              {residentResults.map((resident) => (
                <div
                  key={`${resident.user_id}-${resident.unit_id}`}
                  onClick={() => {
                    if (!visitId) setSelectedResident(resident);
                  }}
                  role="button"
                  tabIndex={visitId ? -1 : 0}
                  onKeyDown={(event) => {
                    if (!visitId && (event.key === "Enter" || event.key === " ")) {
                      event.preventDefault();
                      setSelectedResident(resident);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selectedResident?.unit_id === resident.unit_id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Checkbox
                    checked={selectedResident?.unit_id === resident.unit_id}
                    onClick={(event) => event.stopPropagation()}
                    onCheckedChange={(checked) => setSelectedResident(checked ? resident : null)}
                    disabled={Boolean(visitId)}
                    size="md"
                    aria-label={`Select ${resident.name}, Unit ${resident.unit_number}`}
                  />
                  <UserRound size={17} className="text-slate-500" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-800">{resident.name}</span>
                    <span className="block text-xs text-slate-500">
                      {resident.block_name ? `${resident.block_name} · ` : ""}Unit {resident.unit_number}
                    </span>
                  </span>
                  {selectedResident?.unit_id === resident.unit_id ? (
                    <span className="text-xs font-semibold text-blue-700">Selected</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <FormField label="Visitor Name" required>
              <Input
                value={visitorName}
                disabled={Boolean(visitId)}
                onChange={(event) => setVisitorName(event.target.value)}
              />
            </FormField>
            <FormField label="Mobile Number" required>
              <Input
                value={mobile}
                inputMode="numeric"
                maxLength={10}
                disabled={Boolean(visitId)}
                onChange={(event) => setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </FormField>
            <FormField label="Visitor Type" required>
              <Select
                value={visitorType}
                options={VISITOR_TYPE_OPTIONS}
                placeholder="Select visitor type"
                disabled={Boolean(visitId)}
                onValueChange={setVisitorType}
              />
            </FormField>
            <FormField label="Vehicle Number">
              <Input
                value={vehicleNumber}
                disabled={Boolean(visitId)}
                onChange={(event) => setVehicleNumber(event.target.value)}
              />
            </FormField>
            <FormField label="Purpose" required>
              <Input
                value={purpose}
                disabled={Boolean(visitId)}
                onChange={(event) => setPurpose(event.target.value)}
              />
            </FormField>
          </section>
        </div>
      </FormModal>
    </>
  );
};

export default GateConsolePage;
