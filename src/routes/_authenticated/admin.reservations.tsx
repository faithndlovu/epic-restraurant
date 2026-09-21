import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { updateReservationStatus } from "@/lib/admin.functions";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";
import { Check, X, Trash2, Calendar, Mail, Phone, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/reservations")({
  head: () => ({
    meta: [
      { title: "Admin · Reservations — Epic Restaurant" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminReservations,
});

type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  requests: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

const FILTERS = ["all", "pending", "confirmed", "cancelled", "completed"] as const;
type Filter = (typeof FILTERS)[number];

// Cancelled and completed are end states — the visit either happened or it
// won't. Deleting the record is the only thing left to offer.
function isClosed(status: Reservation["status"]) {
  return status === "cancelled" || status === "completed";
}

function AdminReservations() {
  const [rows, setRows] = useState<Reservation[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const updateStatus = useServerFn(updateReservationStatus);
  const { confirm, dialog } = useConfirm();

  async function load() {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false });
    if (error) setError(error.message);
    else setRows((data ?? []) as Reservation[]);
  }

  useEffect(() => {
    load();
  }, []);

  // Goes through a server function so confirm/cancel can email the guest.
  // It runs as the signed-in admin, so RLS still guards the update.
  async function setStatus(r: Reservation, status: Reservation["status"]) {
    if (
      status === "cancelled" &&
      !(await confirm({
        title: `Cancel ${r.name}'s booking?`,
        description: `The reservation for ${r.party_size} on ${r.reservation_date} at ${r.reservation_time} will be marked cancelled, and ${r.email} will be emailed to let them know.`,
        confirmLabel: "Cancel booking",
        cancelLabel: "Keep booking",
        destructive: true,
      }))
    )
      return;
    setBusyId(r.id);
    try {
      const result = await updateStatus({ data: { id: r.id, status, notifyGuest: true } });
      if (status !== "confirmed" && status !== "cancelled") {
        toast.success(`Marked ${status}.`);
      } else if (result.emailed) {
        toast.success(`Marked ${status}`, { description: `${r.email} has been emailed.` });
      } else {
        // The status change did stick — only the email failed, so this is a
        // warning, not an error, and it carries the reason Resend gave us.
        toast.warning(`Marked ${status}, but the email wasn't sent`, {
          description: result.emailError ?? "No reason was reported.",
          duration: 12000,
        });
      }
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the reservation.");
    } finally {
      setBusyId(null);
    }
  }
  async function remove(id: string) {
    if (
      !(await confirm({
        title: "Delete this reservation?",
        description:
          "It will be removed permanently. The guest is not notified — cancel the booking instead if you want them emailed.",
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return;
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error)
      return toast.error("Could not delete the reservation", { description: error.message });
    toast.success("Reservation deleted.");
    load();
  }

  if (!rows) return <p className="text-muted-foreground">Loading…</p>;

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      {dialog}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl">Reservations</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} total · {rows.filter((r) => r.status === "pending").length} pending
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider border transition ${
                filter === f
                  ? "bg-gold text-charcoal border-gold"
                  : "border-border text-muted-foreground hover:text-gold"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">
          {error}
        </div>
      )}

      <div className="grid gap-3">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-border bg-card p-5 grid lg:grid-cols-[1fr_auto] gap-4 items-start"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-display text-xl">{r.name}</h3>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-sm text-muted-foreground grid sm:grid-cols-2 gap-x-6 gap-y-1">
                <span className="inline-flex items-center gap-2">
                  <Calendar size={14} className="text-gold" /> {r.reservation_date} ·{" "}
                  {r.reservation_time}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users size={14} className="text-gold" /> {r.party_size} guests
                </span>
                <a
                  href={`mailto:${r.email}`}
                  className="inline-flex items-center gap-2 hover:text-gold"
                >
                  <Mail size={14} className="text-gold" /> {r.email}
                </a>
                <a
                  href={`tel:${r.phone}`}
                  className="inline-flex items-center gap-2 hover:text-gold"
                >
                  <Phone size={14} className="text-gold" /> {r.phone}
                </a>
              </div>
              {r.requests && (
                <p className="text-sm text-foreground/80 border-l-2 border-gold/50 pl-3 mt-2">
                  {r.requests}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {/* Only a live booking (pending or confirmed) still has moves. */}
              {!isClosed(r.status) && (
                <>
                  {r.status !== "confirmed" && (
                    <button
                      onClick={() => setStatus(r, "confirmed")}
                      disabled={busyId === r.id}
                      className="disabled:opacity-50 btn-gold rounded-full px-4 py-2 text-xs inline-flex items-center gap-1"
                    >
                      <Check size={14} /> Confirm
                    </button>
                  )}
                  <button
                    onClick={() => setStatus(r, "cancelled")}
                    disabled={busyId === r.id}
                    className="disabled:opacity-50 rounded-full border border-border px-4 py-2 text-xs inline-flex items-center gap-1 hover:border-red-400/60 hover:text-red-300"
                  >
                    <X size={14} /> Cancel
                  </button>
                  {r.status === "confirmed" && (
                    <button
                      onClick={() => setStatus(r, "completed")}
                      disabled={busyId === r.id}
                      className="disabled:opacity-50 rounded-full border border-border px-4 py-2 text-xs"
                    >
                      Mark done
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => remove(r.id)}
                className="rounded-full border border-border px-3 py-2 text-xs hover:text-red-400"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            No reservations.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  const style: Record<Reservation["status"], string> = {
    pending: "bg-amber-500/15 text-amber-300",
    confirmed: "bg-emerald-500/15 text-emerald-300",
    cancelled: "bg-red-500/15 text-red-300",
    completed: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${style[status]}`}
    >
      {status}
    </span>
  );
}
