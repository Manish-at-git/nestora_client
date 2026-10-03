import { useState } from "react";
import { QrCode, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventItem } from "../types";
import { AdminEventPassesModal, EventPassScannerModal } from "./EventPassAdminModal";
import { EventPassBookingModal } from "./EventPassBookingModal";
import { EventPassModal } from "./EventPassModal";

export function EventPassActions({ event, canManage = false }: { event: EventItem; canManage?: boolean }) {
  const [booking, setBooking] = useState(false);
  const [passId, setPassId] = useState<string | null>(null);
  const [listedPassId, setListedPassId] = useState<string | null>(null);
  const [justBookedPassId, setJustBookedPassId] = useState<string | null>(null);
  const [listing, setListing] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!event.has_pass) return null;

  return (
    <div className="space-y-2.5 border-t border-slate-100 pt-3">
      <div className={event.my_pass ? "flex flex-wrap gap-2" : ""}>
        {event.my_pass && (
          <Button
            type="button"
            variant="outline"
            className="min-w-0 flex-1 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
            onClick={() => {
              setJustBookedPassId(null);
              setPassId(event.my_pass!.id);
            }}
          >
            <QrCode size={15} /> View pass & QR ({event.my_pass.remaining_passes} left)
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          className={event.my_pass ? "shrink-0 bg-blue-600 shadow-blue-100 hover:bg-blue-700" : "w-full bg-blue-600 shadow-blue-100 hover:bg-blue-700"}
          onClick={() => setBooking(true)}
        >
          <Ticket size={15} /> {event.my_pass ? "Book more" : `Book pass · ₹${event.pass_price ?? event.fee_amount ?? 0}`}
        </Button>
      </div>
      {canManage && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700"
            onClick={() => setScanning(true)}
          >
            <QrCode size={15} /> Scan passes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
            onClick={() => setListing(true)}
          >
            <Users size={15} /> Pass list
          </Button>
        </div>
      )}
      <EventPassBookingModal
        event={booking ? event : null}
        onClose={() => setBooking(false)}
        onBooked={(id) => {
          setJustBookedPassId(id);
          setPassId(id);
        }}
      />
      <EventPassModal
        passId={passId || listedPassId}
        onClose={() => {
          if (listedPassId) {
            setListedPassId(null);
            return;
          }
          setPassId(null);
          setJustBookedPassId(null);
        }}
        showBookingSuccess={passId === justBookedPassId}
        allowSharing={Boolean(passId)}
      />
      <AdminEventPassesModal
        event={listing ? event : null}
        onClose={() => setListing(false)}
        onView={(id) => {
          setListedPassId(id);
        }}
      />
      <EventPassScannerModal event={scanning ? event : null} onClose={() => setScanning(false)} />
    </div>
  );
}
