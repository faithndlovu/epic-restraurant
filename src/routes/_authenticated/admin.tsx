import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Toaster } from "@/components/ui/sonner";
import { UtensilsCrossed, CalendarCheck, ShieldCheck, LayoutDashboard, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    // Deliberately not a redirect. Bouncing a signed-in user to the homepage
    // without a word reads as a broken site; the component says what happened.
    return { isAdmin: !!data };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { isAdmin } = Route.useRouteContext();

  if (!isAdmin) {
    return (
      <SiteLayout>
        <section className="py-32">
          <div className="mx-auto max-w-lg px-6 text-center">
            <ShieldCheck className="mx-auto text-gold/60" size={40} />
            <h1 className="mt-6 font-display text-3xl">Admin access required</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              You're signed in, but this account doesn't have admin rights. Ask an existing admin to
              add you from the Admins tab of the console.
            </p>
            <Link
              to="/"
              className="mt-8 inline-block btn-outline-gold rounded-full px-6 py-2.5 text-sm"
            >
              Back to the site
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="py-24 md:py-28 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-gold" size={20} />
            <span className="text-xs tracking-[0.35em] uppercase text-gold">Admin</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl">Restaurant Console</h1>
          <p className="mt-3 text-muted-foreground">Manage your menu and incoming reservations.</p>

          <nav className="mt-8 flex flex-wrap gap-2">
            <AdminTab to="/admin" exact icon={<LayoutDashboard size={14} />} label="Dashboard" />
            <AdminTab
              to="/admin/reservations"
              icon={<CalendarCheck size={14} />}
              label="Reservations"
            />
            <AdminTab to="/admin/menu" icon={<UtensilsCrossed size={14} />} label="Menu" />
            <AdminTab to="/admin/admins" icon={<Users size={14} />} label="Admins" />
          </nav>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <Outlet />
        </div>
      </section>

      {/* Action feedback for every admin page. richColors gives success/error/
          warning their own palette, so a failure can't come through looking green. */}
      <Toaster richColors closeButton position="top-right" theme="dark" />
    </SiteLayout>
  );
}

function AdminTab({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      // Without exact, the Dashboard tab (/admin) would stay highlighted on every sub-page.
      activeOptions={{ exact }}
      className="px-5 py-2 rounded-full text-sm border border-border text-muted-foreground hover:text-gold hover:border-gold/60 transition inline-flex items-center gap-2"
      activeProps={{ className: "bg-gold text-charcoal border-gold hover:text-charcoal" }}
    >
      {icon} {label}
    </Link>
  );
}
