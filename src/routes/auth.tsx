import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Epic Restaurant" },
      { name: "description", content: "Sign in to manage your Epic Restaurant account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        // With email confirmation on, signUp returns no session until the
        // link is clicked — tell the user instead of silently redirecting.
        if (!data.session) {
          setNotice(`Check ${email} for a confirmation link, then sign in here.`);
          setMode("signin");
          return;
        }
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message ?? "Google sign-in failed");
    // On success Supabase redirects the browser to Google; the auth state
    // listener in __root.tsx handles the post-redirect session.
  }

  return (
    <SiteLayout>
      <section className="min-h-[80vh] grid place-items-center py-24 px-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="font-display text-3xl text-gold-gradient">Epic Restaurant</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </p>
          </div>

          <button
            onClick={onGoogle}
            className="w-full rounded-full border border-border bg-secondary hover:border-gold/50 transition px-5 py-3 text-sm font-medium flex items-center justify-center gap-3"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"
              />
              <path
                fill="#4CAF50"
                d="M24 43.5c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.4-4.6 2.3-7.4 2.3-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.3 5.3c-.4.4 6.9-5 6.9-14.7 0-1.2-.1-2.4-.3-3.5z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> OR <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-secondary rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-secondary rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-secondary rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            {notice && <p className="text-sm text-gold">{notice}</p>}
            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full rounded-full py-3 text-sm font-semibold tracking-wide disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-gold hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-gold">
              ← Back to site
            </Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
