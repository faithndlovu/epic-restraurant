import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/admins")({
  head: () => ({
    meta: [
      { title: "Admin · Admins — Epic Restaurant" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAdmins,
});

type Admin = {
  user_id: string;
  email: string;
  display_name: string | null;
  granted_at: string;
};

function AdminAdmins() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  // All three calls are database functions that re-check the caller is an
  // admin, so this page can't be used to escalate privileges.
  async function load() {
    const { data, error } = await supabase.rpc("list_admins");
    if (error) setError(error.message);
    else setAdmins(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function grant(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const target = email.trim();
    const { error } = await supabase.rpc("grant_admin", { _email: target });
    setBusy(false);
    if (error) return toast.error("Could not grant admin access", { description: error.message });
    toast.success(`${target} is now an admin`, {
      description: "They'll see the Admin link next time they sign in.",
    });
    setEmail("");
    load();
  }

  async function revoke(admin: Admin) {
    const isSelf = admin.user_id === user?.id;
    const ok = await confirm(
      isSelf
        ? {
            title: "Remove your own admin access?",
            description:
              "You'll be sent out of the admin area immediately and won't be able to get back in unless another admin grants you access again.",
            confirmLabel: "Remove my access",
            destructive: true,
          }
        : {
            title: `Remove admin access for ${admin.email}?`,
            description:
              "They'll keep their account but lose the admin area, including the menu and reservations. You can grant it back at any time.",
            confirmLabel: "Remove access",
            destructive: true,
          },
    );
    if (!ok) return;
    const { error } = await supabase.rpc("revoke_admin", { _user_id: admin.user_id });
    if (error) return toast.error("Could not remove admin access", { description: error.message });
    if (isSelf) return navigate({ to: "/" });
    toast.success(`${admin.email} is no longer an admin.`);
    load();
  }

  return (
    <div className="space-y-6">
      {dialog}
      <div>
        <h2 className="font-display text-2xl">Admins</h2>
        <p className="text-sm text-muted-foreground">
          Admins can edit the menu and manage every reservation.
        </p>
      </div>

      <form
        onSubmit={grant}
        className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <label className="flex-1 block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">
            Add an admin by email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className="w-full bg-secondary rounded-md px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="btn-gold rounded-full px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <UserPlus size={16} /> {busy ? "Adding…" : "Make admin"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground -mt-3">
        The person must create an account at /auth first.
      </p>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 text-red-300 text-sm p-3">
          {error}
        </div>
      )}

      {!admins ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-xl border border-border divide-y divide-border">
          {admins.map((a) => (
            <div key={a.user_id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0">
                <ShieldCheck size={18} className="text-gold shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {a.display_name || a.email}
                    {a.user_id === user?.id && (
                      <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.email} · since {new Date(a.granted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => revoke(a)}
                disabled={admins.length <= 1}
                title={admins.length <= 1 ? "You can't remove the last admin" : undefined}
                className="rounded-full border border-border px-3 py-2 text-xs inline-flex items-center gap-1 hover:text-red-400 hover:border-red-400/60 disabled:opacity-40 disabled:pointer-events-none"
              >
                <UserMinus size={14} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
