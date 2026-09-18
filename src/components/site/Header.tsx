import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, ShieldCheck, LogIn } from "lucide-react";
import { logo } from "@/assets/images";
import { useIsAdmin } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/menu", label: "Menu" },
  { to: "/gallery", label: "Gallery" },
  { to: "/reservations", label: "Reservations" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={logo.url}
            alt="Epic Restaurant logo"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-gold/40"
          />
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg text-gold-gradient">Epic</span>
            <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
              Restaurant
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm tracking-wide text-foreground/80 hover:text-gold transition-colors relative group"
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/menu"
              className="text-xs tracking-wider uppercase text-gold hover:text-gold-bright inline-flex items-center gap-1.5"
            >
              <ShieldCheck size={14} /> Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="text-xs text-muted-foreground hover:text-gold inline-flex items-center gap-1.5"
              aria-label="Sign out"
            >
              <LogOut size={14} /> Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="text-xs text-muted-foreground hover:text-gold inline-flex items-center gap-1.5"
            >
              <LogIn size={14} /> Sign in
            </Link>
          )}
          <Link
            to="/reservations"
            className="btn-gold rounded-full px-5 py-2.5 text-sm font-medium"
          >
            Book a Table
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden text-gold p-2"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-fade-up">
          <div className="flex flex-col px-6 py-4 gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-foreground/90 hover:text-gold border-b border-border/60"
                activeProps={{ className: "text-gold" }}
              >
                {n.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin/menu"
                onClick={() => setOpen(false)}
                className="py-3 text-gold border-b border-border/60 inline-flex items-center gap-2"
              >
                <ShieldCheck size={14} /> Admin Console
              </Link>
            )}
            {user ? (
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="py-3 text-left text-muted-foreground border-b border-border/60 inline-flex items-center gap-2"
              >
                <LogOut size={14} /> Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="py-3 text-muted-foreground border-b border-border/60 inline-flex items-center gap-2"
              >
                <LogIn size={14} /> Sign in
              </Link>
            )}
            <Link
              to="/reservations"
              onClick={() => setOpen(false)}
              className="btn-gold rounded-full px-5 py-3 text-center text-sm font-medium mt-3"
            >
              Book a Table
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
