import React, { useEffect, useState } from "react";
import { ArrowLeft, Plus, ShieldAlert } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAppSelector } from "@/app/hooks";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CODE } from "@/constants/roleCodes";
import { usePageHeader } from "@/hooks/usePageHeader";
import { resolveMediaUrl } from "@/lib/cloudUploader";
import apiClient from "@/services/api/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { DiscussionThread, EmptyState, LoadingSpinner, StatusPill } from "@/components/common";
import { useAdminReviewViolationMutation, useBoardDecideViolationMutation, useGetViolationFineDefaultQuery, useGetViolationMessagesQuery, useGetViolationsQuery, useRespondToViolationMutation, useSendViolationMessageMutation } from "../api/violationsApi";
import { ViolationFormModal, ViolationTable } from "../components";
import type { Violation } from "../types";

const responseOptions = ["Accept", "Discuss with Board", "Extension"];
const adminViews = [
  { value: "new_admin", label: "New reports" },
  { value: "pending_board", label: "Pending board" },
  { value: "approved", label: "Approved by board" },
  { value: "active", label: "Active violations" },
  { value: "dismissed", label: "Dismissed" },
  { value: "all", label: "All violations" },
] as const;
type AdminViolationView = (typeof adminViews)[number]["value"];
const boardViews = [
  { value: "pending_board", label: "Pending approval" },
  { value: "approved", label: "Approved violations" },
  { value: "board_all", label: "All violations" },
  { value: "against_me", label: "Reports against me" },
] as const;
type BoardViolationView = (typeof boardViews)[number]["value"];

export const ViolationsPage: React.FC = () => {
  const { violationId } = useParams<{ violationId?: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { account } = useAuth();
  const role = account?.role_code;
  const isHomeowner = role === ROLE_CODE.HOMEOWNER;
  const isAdmin = role === ROLE_CODE.ADMIN || role === ROLE_CODE.SUPER_ADMIN;
  const isBoard = role === ROLE_CODE.BOARD_MEMBER;
  const activeAssociationId = useAppSelector(
    (state) => state.ui.activeAssociationId,
  );
  const tab = searchParams.get("tab");
  const homeownerView: "my_violations" | "against_me" = tab === "against_me" ? "against_me" : "my_violations";
  const adminView: AdminViolationView = adminViews.some((view) => view.value === tab)
    ? tab as AdminViolationView
    : "new_admin";
  const boardView: BoardViolationView = boardViews.some((view) => view.value === tab)
    ? tab as BoardViolationView
    : "pending_board";
  const scope = isHomeowner ? homeownerView : isAdmin ? adminView : boardView;
  const violationsUrl = searchParams.toString() ? `/violations?${searchParams.toString()}` : "/violations";
  const openViolation = (id: string) => navigate({
    pathname: `/violations/${id}`,
    search: searchParams.toString() ? `?${searchParams.toString()}` : "",
  });
  const setTab = (value: string, defaultValue: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === defaultValue) nextParams.delete("tab");
    else nextParams.set("tab", value);
    setSearchParams(nextParams, { replace: true });
  };
  const associationId = isAdmin && activeAssociationId && activeAssociationId !== "ALL"
    ? String(activeAssociationId)
    : undefined;
  const { data: violations = [], isLoading, refetch } = useGetViolationsQuery({
    scope,
    association_id: associationId,
  }, { skip: Boolean(violationId) });
  const [detailViolation, setDetailViolation] = useState<Violation | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(Boolean(violationId));

  useEffect(() => {
    if (!violationId) {
      setDetailViolation(null);
      setIsDetailLoading(false);
      return;
    }

    let isCurrent = true;
    setIsDetailLoading(true);
    apiClient.get<{ data: Violation }>(`/violations/${violationId}`)
      .then((response) => {
        if (isCurrent) setDetailViolation(response.data.data);
      })
      .catch(() => {
        if (isCurrent) setDetailViolation(null);
      })
      .finally(() => {
        if (isCurrent) setIsDetailLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [violationId]);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Violation | null>(null);

  usePageHeader({ title: violationId ? "Violation Details" : "Violations", description: violationId ? "Review the complete violation record and available actions." : isHomeowner ? "Submit and track association violation reports." : "Review and resolve association violation reports." });

  if (!isHomeowner && !isAdmin && !isBoard) return <EmptyState icon={<ShieldAlert size={34} className="text-slate-400" />} title="Violations are not available" description="Your role is not permitted to access this workflow." />;

  if (violationId) {
    if (isDetailLoading) return <LoadingSpinner />;
    if (!detailViolation) return <EmptyState icon={<ShieldAlert size={34} className="text-slate-400" />} title="Violation not found" description="This report is unavailable or you do not have access to it." />;
    if (isHomeowner) return <ViolationDetailDialog violation={detailViolation} canRespond onClose={() => navigate(violationsUrl)} onMutated={() => navigate(violationsUrl)} isHomeowner isAdmin={false} isBoard={false} />;
    return <ViolationDetailPage violation={detailViolation} canRespond={isHomeowner || Boolean(detailViolation.is_current_user_violator)} isHomeowner={isHomeowner} isAdmin={isAdmin} isBoard={isBoard} onBack={() => navigate(violationsUrl)} />;
  }

  return <div className="space-y-6">
    {isHomeowner && (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={homeownerView}
          onValueChange={(value) => setTab(value, "my_violations")}
        >
          <TabsList>
            <TabsTrigger value="my_violations">My violations</TabsTrigger>
            <TabsTrigger value="against_me">Reports against me</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Report a violation
        </Button>
      </div>
    )}
    {isAdmin ? (
      <>
        <Tabs value={adminView} onValueChange={(value) => setTab(value, "new_admin")}>
          <TabsList>
            {adminViews.map((view) => (
              <TabsTrigger key={view.value} value={view.value}>
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ViolationTable violations={violations} isLoading={isLoading} scope={scope} showReporter onView={(row) => openViolation(row.id)} />
      </>
    ) : isBoard ? (
      <>
        <Tabs value={boardView} onValueChange={(value) => setTab(value, "pending_board")}>
          <TabsList>
            {boardViews.map((view) => (
              <TabsTrigger key={view.value} value={view.value}>
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <ViolationTable violations={violations} isLoading={isLoading} scope={scope} onView={(row) => openViolation(row.id)} />
      </>
    ) : (
      <ViolationTable violations={violations} isLoading={isLoading} scope={scope} onView={(row) => isHomeowner ? setSelected(row) : openViolation(row.id)} />
    )}
    <ViolationFormModal open={createOpen} onOpenChange={setCreateOpen} />
    {selected && <ViolationDetailDialog violation={selected} canRespond={homeownerView === "against_me"} isHomeowner onClose={() => setSelected(null)} onMutated={() => { setSelected(null); refetch(); }} isAdmin={false} isBoard={false} />}
  </div>;
};

const ViolationDetailPage: React.FC<{
  violation: Violation;
  canRespond: boolean;
  isHomeowner: boolean;
  isAdmin: boolean;
  isBoard: boolean;
  onBack: () => void;
}> = ({ violation, canRespond, isHomeowner, isAdmin, isBoard, onBack }) => {
  const { account } = useAuth();
  const [adminReview, { isLoading: reviewing }] = useAdminReviewViolationMutation();
  const [boardDecision, { isLoading: deciding }] = useBoardDecideViolationMutation();
  const [respond, { isLoading: responding }] = useRespondToViolationMutation();
  const [sendMessage] = useSendViolationMessageMutation();
  const { data: messages = [] } = useGetViolationMessagesQuery(violation.id, { skip: !isBoard });
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState("Fine");
  const [offenseCount, setOffenseCount] = useState("1");
  const [fine, setFine] = useState("");
  const [hasSetDefaultFine, setHasSetDefaultFine] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const responseAllowed = canRespond && violation.status === "Approved" && violation.action === "Fine" && !violation.violator_response;
  const { data: fineDefault } = useGetViolationFineDefaultQuery(violation.id, {
    skip: !isAdmin || violation.status !== "New" || action !== "Fine",
  });

  useEffect(() => {
    if (hasSetDefaultFine || fineDefault?.amount == null) return;
    setFine(String(fineDefault.amount));
    setHasSetDefaultFine(true);
  }, [fineDefault?.amount, hasSetDefaultFine]);

  const review = async (outcome: "Pending Board" | "Rejected" | "Dismissed") => {
    try {
      await adminReview({ id: violation.id, data: { offense_count: Number(offenseCount), action, fine_amount: action === "Fine" ? Number(fine) : undefined, admin_notes: notes || undefined, outcome } }).unwrap();
      toast.success("Violation review saved.");
      onBack();
    } catch {
      toast.error(action === "Fine" && !fine ? "Enter a fine amount." : "Unable to save the review.");
    }
  };
  const decide = async (outcome: "Approved" | "Rejected") => {
    try {
      await boardDecision({ id: violation.id, data: { outcome, board_notes: notes || undefined } }).unwrap();
      toast.success("Board decision saved.");
      onBack();
    } catch {
      toast.error("Unable to save the board decision.");
    }
  };
  const submitResponse = async () => {
    try {
      await respond({ id: violation.id, response }).unwrap();
      toast.success("Response recorded.");
      onBack();
    } catch {
      toast.error("Unable to record the response.");
    }
  };
  const submitMessage = async () => {
    if (!message.trim()) return;
    try {
      await sendMessage({ id: violation.id, body: message.trim() }).unwrap();
      setMessage("");
    } catch {
      toast.error("Unable to send the message.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} title="Back to violations">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-rose-50 px-2 py-1 font-mono text-sm font-bold text-rose-600">{violation.display_id}</span>
              <h2 className="text-xl font-semibold text-slate-900">{isHomeowner ? "Violation Report Details" : violation.title}</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">{violation.category} · Created {new Date(violation.created_at).toLocaleString()}</p>
          </div>
        </div>
        <StatusPill status={violation.status} />
      </div>

      {isHomeowner && <HomeownerViolationDetails violation={violation} />}
      {isAdmin && <AdminViolationDetails violation={violation} canReview={violation.status === "New"} action={action} onActionChange={setAction} offenseCount={offenseCount} onOffenseCountChange={setOffenseCount} fine={fine} onFineChange={setFine} notes={notes} onNotesChange={setNotes} isReviewing={reviewing} onForward={() => review("Pending Board")} onReject={() => review("Rejected")} />}
      {isBoard && <BoardViolationDetails violation={violation} canDecide={!violation.is_current_user_violator} notes={notes} onNotesChange={setNotes} isDeciding={deciding} onApprove={() => decide("Approved")} onReject={() => decide("Rejected")} />}
      {responseAllowed && <Card className="space-y-3 p-4"><h3 className="font-semibold">Your response</h3><Select value={response} onValueChange={setResponse} options={responseOptions} placeholder="Choose one response" /><Button disabled={!response || responding} onClick={submitResponse}>Submit response</Button></Card>}
      {isBoard && <DiscussionThread title="Board & violator chat" description="Communicate directly with the violator regarding their response or extension request." messages={messages.map((item) => ({ id: item.id, senderId: item.sender_account_id, senderName: item.sender_name, body: item.body, createdAt: item.created_at }))} currentUserId={account?.id || account?.account_id} value={message} onChange={setMessage} onSend={submitMessage} placeholder="Type your response to the violator…" />}
    </div>
  );
};

const ViolationDetailDialog: React.FC<{ violation: Violation; canRespond: boolean; isHomeowner: boolean; isAdmin: boolean; isBoard: boolean; onClose: () => void; onMutated: () => void }> = ({ violation, canRespond, isHomeowner, isAdmin, isBoard, onClose, onMutated }) => {
  const { account } = useAuth();
  const [adminReview, { isLoading: reviewing }] = useAdminReviewViolationMutation();
  const [boardDecision, { isLoading: deciding }] = useBoardDecideViolationMutation();
  const [respond, { isLoading: responding }] = useRespondToViolationMutation();
  const [sendMessage] = useSendViolationMessageMutation();
  const { data: messages = [] } = useGetViolationMessagesQuery(violation.id, { skip: !isBoard });
  const [notes, setNotes] = useState("");
  const [action, setAction] = useState("Fine");
  const [offenseCount, setOffenseCount] = useState("1");
  const [fine, setFine] = useState("");
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const responseAllowed = canRespond && violation.status === "Approved" && violation.action === "Fine" && !violation.violator_response;

  const review = async (outcome: "Pending Board" | "Rejected" | "Dismissed") => {
    try { await adminReview({ id: violation.id, data: { offense_count: Number(offenseCount), action, fine_amount: action === "Fine" ? Number(fine) : undefined, admin_notes: notes || undefined, outcome } }).unwrap(); toast.success("Violation review saved."); onMutated(); } catch { toast.error(action === "Fine" && !fine ? "Enter a fine amount." : "Unable to save the review."); }
  };
  const decide = async (outcome: "Approved" | "Rejected") => {
    try { await boardDecision({ id: violation.id, data: { outcome, board_notes: notes || undefined } }).unwrap(); toast.success("Board decision saved."); onMutated(); } catch { toast.error("Unable to save the board decision."); }
  };
  const submitResponse = async () => { try { await respond({ id: violation.id, response }).unwrap(); toast.success("Response recorded."); onMutated(); } catch { toast.error("Unable to record the response."); } };
  const submitMessage = async () => { if (!message.trim()) return; try { await sendMessage({ id: violation.id, body: message.trim() }).unwrap(); setMessage(""); } catch { toast.error("Unable to send the message."); } };

  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className={`${isBoard ? "max-w-5xl" : "max-w-2xl"} max-h-[90vh] overflow-y-auto`}><DialogHeader><DialogTitle className="flex items-center gap-2">{isHomeowner || isBoard ? <><span className="rounded-md bg-rose-50 px-2 py-1 font-mono text-sm font-bold text-rose-600">{violation.display_id}</span><span>{isBoard ? violation.title : "Violation Report Details"}</span></> : <>{violation.display_id} · {violation.title}</>}</DialogTitle><DialogDescription>{violation.category} · {violation.status}</DialogDescription></DialogHeader>
    <div className="space-y-4 text-sm">{isHomeowner ? <HomeownerViolationDetails violation={violation} /> : !isAdmin && !isBoard ? <Card className="p-4 space-y-2"><p className="whitespace-pre-wrap text-slate-700">{violation.description}</p>{violation.proof_url && <a className="text-blue-600 underline" href={violation.proof_url} target="_blank" rel="noreferrer">Open submitted proof</a>}<div className="grid grid-cols-2 gap-2 text-slate-500">{violation.offense_count && <span>Offense {violation.offense_count}</span>}{violation.fine_amount && <span>Fine: ₹{violation.fine_amount}</span>}{violation.violator_response && <span>Response: {violation.violator_response}</span>}</div></Card> : null}
      {isAdmin && violation.status === "New" && <div className="grid gap-4 lg:grid-cols-2"><Card className="space-y-4 bg-slate-50 p-4"><h3 className="border-b border-slate-200 pb-3 font-semibold text-slate-900">Violation incident details</h3><DetailItem label="Reporter homeowner" value={`${violation.reporter_name || "Homeowner"}${violation.reporter_unit_number ? ` · Unit ${violation.reporter_unit_number}` : ""}`} /><DetailItem label="Target homeowner" value={violation.knows_violator ? `${violation.violator_name || "Homeowner"}${violation.violator_unit_number ? ` · Unit ${violation.violator_unit_number}` : ""}` : "Not identified"} /><DetailItem label="Description" value={violation.description} boxed />{violation.proof_url && <section className="space-y-2"><p className="text-xs text-slate-500">Uploaded picture proof</p><a href={resolveMediaUrl(violation.proof_url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 bg-white"><img src={resolveMediaUrl(violation.proof_url)} alt="Submitted violation proof" className="max-h-48 w-full object-contain" /><span className="block bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-indigo-600">View original picture ↗</span></a></section>}</Card><Card className="space-y-3 border-rose-200 bg-rose-50/30 p-4"><h3 className="border-b border-rose-200 pb-3 font-semibold text-slate-900">Admin verification & fine setup</h3><Select label="Violation type" value={violation.category} options={[violation.category]} disabled /><Select label="Violation count" value={offenseCount} onValueChange={setOffenseCount} options={[{ value: "1", label: "1st offense" }, { value: "2", label: "2nd offense" }, { value: "3", label: "3rd offense" }]} /><Select label="Action" required value={action} onValueChange={setAction} options={["Fine", "Waive Off"]} />{action === "Fine" && <Input label="Violation fine amount (₹)" type="number" min="1" value={fine} onChange={(event) => setFine(event.target.value)} />}<Textarea label="Admin verification notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Verified against association rules…" /><div className="flex flex-wrap gap-2"><Button className="flex-1" disabled={reviewing} onClick={() => review("Pending Board")}>Approve & forward to board</Button><Button variant="outline" disabled={reviewing} onClick={() => review("Rejected")}>Reject</Button><Button variant="outline" disabled={reviewing} onClick={() => review("Dismissed")}>Dismiss</Button></div></Card></div>}
      {isBoard && <BoardViolationDetails violation={violation} canDecide={!violation.is_current_user_violator} notes={notes} onNotesChange={setNotes} isDeciding={deciding} onApprove={() => decide("Approved")} onReject={() => decide("Rejected")} />}
      {responseAllowed && <Card className="p-4 space-y-3"><h3 className="font-semibold">Your response</h3><Select value={response} onValueChange={setResponse} options={responseOptions} placeholder="Choose one response" /><Button disabled={!response || responding} onClick={submitResponse}>Submit response</Button></Card>}
      {isBoard && <DiscussionThread title="Board & violator chat" description="Communicate directly with the violator regarding their response or extension request." messages={messages.map((item) => ({ id: item.id, senderId: item.sender_account_id, senderName: item.sender_name, body: item.body, createdAt: item.created_at }))} currentUserId={account?.id || account?.account_id} value={message} onChange={setMessage} onSend={submitMessage} placeholder="Type your response to the violator…" />}
    </div><DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
  </DialogContent></Dialog>;
};

const HomeownerViolationDetails: React.FC<{ violation: Violation }> = ({ violation }) => (
  <>
    <Card className="grid grid-cols-2 gap-x-8 gap-y-4 bg-slate-50 p-4 text-sm">
      <DetailItem label="Violation type" value={violation.category} />
      <DetailItem label="Created on" value={new Date(violation.created_at).toLocaleString()} />
      <DetailItem label="Target homeowner" value={violation.violator_name || "Not identified"} />
      <DetailItem label="Target unit" value={violation.violator_unit_number || "Not identified"} />
    </Card>
    <DetailItem label="Subject" value={violation.title} boxed />
    <DetailItem label="Violation detail" value={violation.description} boxed />
    {violation.proof_url && <section className="space-y-2"><p className="text-xs font-medium text-slate-500">Uploaded picture proof</p><a href={resolveMediaUrl(violation.proof_url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-100"><img src={resolveMediaUrl(violation.proof_url)} alt="Submitted violation proof" className="max-h-64 w-full object-contain" /><span className="block bg-slate-800 px-3 py-2 text-center text-xs font-semibold text-white">View full-size picture ↗</span></a></section>}
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">Your report has been submitted to Association Management for review. To ensure community fairness and confidentiality, violation discussions and dispute resolution occur directly between the Board and the involved party.</div>
  </>
);

const AdminViolationDetails: React.FC<{
  violation: Violation;
  canReview: boolean;
  action: string;
  onActionChange: (value: string) => void;
  offenseCount: string;
  onOffenseCountChange: (value: string) => void;
  fine: string;
  onFineChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isReviewing: boolean;
  onForward: () => void;
  onReject: () => void;
}> = ({
  violation,
  canReview,
  action,
  onActionChange,
  offenseCount,
  onOffenseCountChange,
  fine,
  onFineChange,
  notes,
  onNotesChange,
  isReviewing,
  onForward,
  onReject,
}) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <Card className="space-y-4 bg-slate-50 p-4">
      <h3 className="border-b border-slate-200 pb-3 font-semibold text-slate-900">
        Violation incident details
      </h3>
      <DetailItem
        label="Reporter homeowner"
        value={`${violation.reporter_name || "Homeowner"}${violation.reporter_unit_number ? ` · Unit ${violation.reporter_unit_number}` : ""}`}
      />
      <DetailItem
        label="Target homeowner"
        value={violation.knows_violator
          ? `${violation.violator_name || "Homeowner"}${violation.violator_unit_number ? ` · Unit ${violation.violator_unit_number}` : ""}`
          : "Not identified"}
      />
      <DetailItem label="Description" value={violation.description} boxed />
      {violation.proof_url && (
        <section className="space-y-2">
          <p className="text-xs text-slate-500">Uploaded picture proof</p>
          <a
            href={resolveMediaUrl(violation.proof_url)}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-xl border border-slate-200 bg-white"
          >
            <img
              src={resolveMediaUrl(violation.proof_url)}
              alt="Submitted violation proof"
              className="max-h-64 w-full object-contain"
            />
            <span className="block bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-indigo-600">
              View original picture ↗
            </span>
          </a>
        </section>
      )}
    </Card>

    <Card className="flex h-full flex-col border-rose-200 bg-rose-50/30 p-4">
      <h3 className="border-b border-rose-200 pb-3 font-semibold text-slate-900">
        Admin verification & fine setup
      </h3>
      {canReview ? <>
        <div className="space-y-4 pt-4">
        <Select label="Violation type" value={violation.category} options={[violation.category]} disabled />
        <Select
          label="Violation count"
          value={offenseCount}
          onValueChange={onOffenseCountChange}
          options={[
            { value: "1", label: "1st offense" },
            { value: "2", label: "2nd offense" },
            { value: "3", label: "3rd offense" },
          ]}
        />
        <Select
          label="Action"
          required
          value={action}
          onValueChange={onActionChange}
          options={["Fine", "Waive Off"]}
        />
        {action === "Fine" && (
          <Input
            label="Violation fine amount (₹)"
            type="number"
            min="1"
            value={fine}
            onChange={(event) => onFineChange(event.target.value)}
          />
        )}
        <Textarea
          label="Admin verification notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Verified against association rules…"
        />
        </div>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-rose-200 pt-6">
          <Button className="flex-1" disabled={isReviewing} onClick={onForward}>
            Approve & forward to board
          </Button>
          <Button variant="outline" disabled={isReviewing} onClick={onReject}>
            Reject
          </Button>
        </div>
      </> : <div className="space-y-4 pt-4">
        <DetailItem label="Current status" value={violation.status} boxed />
        <DetailItem label="Violation count" value={violation.offense_count ? `${violation.offense_count} offense` : "Not set"} boxed />
        <DetailItem label="Action" value={violation.action || "Not set"} boxed />
        {violation.fine_amount != null && <DetailItem label="Fine amount" value={`₹${violation.fine_amount}`} boxed />}
        {violation.admin_notes && <DetailItem label="Admin verification notes" value={violation.admin_notes} boxed />}
        {violation.board_notes && <DetailItem label="Board decision notes" value={violation.board_notes} boxed />}
      </div>}
    </Card>
  </div>
);

const BoardViolationDetails: React.FC<{
  violation: Violation;
  canDecide: boolean;
  notes: string;
  onNotesChange: (value: string) => void;
  isDeciding: boolean;
  onApprove: () => void;
  onReject: () => void;
}> = ({ violation, canDecide, notes, onNotesChange, isDeciding, onApprove, onReject }) => (
  <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
    <Card className="space-y-4 bg-slate-50 p-4">
      <h3 className="border-b border-slate-200 pb-3 font-semibold text-slate-900">
        Violation & admin review overview
      </h3>
      <DetailItem
        label="Reporter (confidential)"
        value={`${violation.reporter_name || "Homeowner"}${violation.reporter_unit_number ? ` · Unit ${violation.reporter_unit_number}` : ""}`}
      />
      <DetailItem
        label="Target violator"
        value={violation.knows_violator ? `${violation.violator_name || "Homeowner"}${violation.violator_unit_number ? ` · Unit ${violation.violator_unit_number}` : ""}` : "Not identified"}
      />
      <DetailItem label="Incident description" value={violation.description} boxed />
      {violation.proof_url && (
        <section className="space-y-2">
          <p className="text-xs text-slate-500">Picture proof</p>
          <a href={resolveMediaUrl(violation.proof_url)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img src={resolveMediaUrl(violation.proof_url)} alt="Submitted violation proof" className="max-h-48 w-full object-contain" />
            <span className="block bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-indigo-600">View full-size picture ↗</span>
          </a>
        </section>
      )}
      {violation.admin_notes && <DetailItem label="Admin review remarks" value={violation.admin_notes} boxed />}
    </Card>
    <Card className="flex h-full flex-col border-indigo-200 bg-indigo-50/30 p-4">
      <div>
        <h3 className="font-semibold text-slate-900">Board approval action</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">Approving marks this violation as approved and notifies the reported homeowner.</p>
      </div>
      {!canDecide ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-relaxed text-amber-900">
          This report is against you. Another Board Member must make the decision.
        </div>
      ) : violation.status === "Pending Board" ? <>
          <div className="pt-4">
            <Textarea label="Board notes / decision remarks" value={notes} onChange={(event) => onNotesChange(event.target.value)} placeholder="Enter remarks for the board decision…" />
          </div>
          <div className="mt-auto flex gap-2 border-t border-indigo-200 pt-6">
            <Button className="flex-1" disabled={isDeciding} onClick={onApprove}>Approve violation</Button>
            <Button variant="outline" disabled={isDeciding} onClick={onReject}>Reject</Button>
          </div>
        </> : (
        <DetailItem label="Board decision" value={violation.status} boxed />
      )}
    </Card>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string; boxed?: boolean }> = ({ label, value, boxed = false }) => (
  <div className={boxed ? "space-y-1" : "space-y-0.5"}>
    <p className="text-xs text-slate-500">{label}</p>
    <p className={boxed ? "rounded-xl bg-slate-50 px-3 py-3 font-medium text-slate-800" : "font-medium text-slate-800"}>{value}</p>
  </div>
);
