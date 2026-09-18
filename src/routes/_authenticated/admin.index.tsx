import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, Clock, UtensilsCrossed, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin · Dashboard — Epic Restaurant" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Upcoming = {
  id: string;
  name: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: "pending" | "confirmed";
};

type Stats = {
  pending: number;
  todayBookings: number;
  todayGuests: number;
  nextWeek: number;
  menuAvailable: number;
  menuHidden: number;
  upcoming: Upcoming[];
};

// Local calendar date, not UTC — reservation_date is the restaurant's local day.
function localDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function loadStats(): Promise<Stats> {
  const today = localDate();
  const weekEnd = localDate(7);

  const [pending, upcoming, menu] = await Promise.all([
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reservations")
      .select("id,name,party_size,reservation_date,reservation_time,status")
      .gte("reservation_date", today)
      .lte("reservation_date", weekEnd)
      .in("status", ["pending", "confirmed"])
      .order("reservation_date")
      .order("reservation_time"),
    supabase.from("menu_items").select("is_available"),
  ]);
  const failed = pending.error ?? upcoming.error ?? menu.error;
  if (failed) throw new Error(failed.message);

  const rows = (upcoming.data ?? []) as Upcoming[];
  const todays = rows.filter((r) => r.reservation_date === today);
  const items = menu.data ?? [];
  return {
    pending: pending.count ?? 0,
    todayBookings: todays.length,
    todayGuests: todays.reduce((sum, r) => sum + r.party_size, 0),
    nextWeek: rows.length,
    menuAvailable: items.filter((i) => i.is_available).length,
    menuHidden: items.filter((i) => !i.is_available).length,
    upcoming: rows.slice(0, 8),
  };
}

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">
        {error}
      </div>
    );
  if (!stats) return <p className="text-muted-foreground">Loading…</p>;

  const today = localDate();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock size={18} />}
          label="Awaiting confirmation"
          value={stats.pending}
          highlight={stats.pending > 0}
        />
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Bookings today"
          value={stats.todayBookings}
          sub={`${stats.todayGuests} guest${stats.todayGuests === 1 ? "" : "s"}`}
        />
        <StatCard icon={<Users size={18} />} label="Next 7 days" value={stats.nextWeek} />
        <StatCard
          icon={<UtensilsCrossed size={18} />}
          label="Dishes on menu"
          value={stats.menuAvailable}
          sub={stats.menuHidden ? `${stats.menuHidden} hidden` : undefined}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl">Coming up this week</h2>
          <Link
            to="/admin/reservations"
            className="text-sm text-gold hover:text-gold-bright inline-flex items-center gap-1"
          >
            All reservations <ArrowRight size={14} />
          </Link>
        </div>
        {stats.upcoming.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">No bookings in the next 7 days.</p>
        ) : (
          <ul className="divide-y divide-border">
            {stats.upcoming.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.reservation_date === today ? "Today" : r.reservation_date} ·{" "}
                    {r.reservation_time} · {r.party_size} guest{r.party_size === 1 ? "" : "s"}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${
                    r.status === "pending"
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-emerald-500/15 text-emerald-300"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 ${highlight ? "border-gold/60" : "border-border"}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        <span className="text-gold">{icon}</span>
        {label}
      </div>
      <div className="mt-3 font-display text-4xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
