import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/auth_/callback")({
  // Purely a client-side landing pad: the tokens arrive in the URL fragment,
  // which never reaches the server, so there is nothing to render on it.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in — Epic Restaurant" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthCallbackPage,
});

// Supabase reports a failed link (expired, already used, wrong redirect) as
// params on the hash for the implicit flow and on the query string for PKCE.
function readLinkError(): string | null {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const description = hash.get("error_description") ?? query.get("error_description");
  const code = hash.get("error") ?? query.get("error");
  if (!description && !code) return null;
  return description ?? code;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const linkError = readLinkError();
      if (linkError) {
        setError(linkError);
        return;
      }

      // getSession() waits on the client's initialization, which is what
      // consumes the tokens from the URL (detectSessionInUrl defaults to on).
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (cancelled) return;
      if (sessionError || !data.session) {
        setError(sessionError?.message ?? "That sign-in link is no longer valid.");
        return;
      }

      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (cancelled) return;

      navigate({ to: role ? "/admin" : "/" });
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <SiteLayout>
      <section className="min-h-[80vh] grid place-items-center py-24 px-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 md:p-10 text-center">
          <div className="font-display text-3xl text-gold-gradient">Epic Restaurant</div>
          {error ? (
            <>
              <p className="mt-4 text-sm text-red-400">{error}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Request a new link, or sign in with your password.
              </p>
              <Link
                to="/auth"
                className="btn-gold mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-medium"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Signing you in…</p>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
