import { useParams } from "react-router-dom";
import { useGetEventPassQuery } from "../api/eventsApi";
import { EventPassContent } from "../components/EventPassModal";

export function EventPassPage() {
  const { passId = "" } = useParams<{ passId: string }>();
  const { data, isLoading, error } = useGetEventPassQuery(passId, { skip: !passId });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-5 rounded-2xl bg-white p-5 shadow-sm">
        {isLoading && <p>Loading digital pass…</p>}
        {error && <p className="text-rose-600">This pass could not be found.</p>}
        {data && <EventPassContent data={data} />}
      </div>
    </main>
  );
}
