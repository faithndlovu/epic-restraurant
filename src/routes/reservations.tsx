import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import { Check, Calendar, Clock, Users } from "lucide-react";
import { brownPlate as img4 } from "@/assets/images";
import { submitReservation } from "@/lib/reservations.functions";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "Reservations — Epic Restaurant" },
      {
        name: "description",
        content:
          "Reserve your table at Epic Restaurant in Bulawayo. Quick and easy online booking with instant email confirmation.",
      },
      { property: "og:title", content: "Reservations — Epic Restaurant" },
      { property: "og:description", content: "Reserve your table at Epic Restaurant in Bulawayo." },
      { property: "og:url", content: "/reservations" },
    ],
    links: [{ rel: "canonical", href: "/reservations" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "/reservations",
            inLanguage: "en",
            actionPlatform: [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform",
            ],
          },
          result: { "@type": "Reservation", name: "Table reservation" },
          provider: { "@type": "Restaurant", name: "Epic Restaurant" },
        }),
      },
    ],
  }),
  component: Reservations,
});

function Reservations() {
  const submit = useServerFn(submitReservation);
  // null = not submitted yet. Once submitted, tracks whether the guest
  // confirmation email actually went out, so we never claim we sent one.
  const [emailed, setEmailed] = useState<boolean | null>(null);
  const submitted = emailed !== null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    party_size: 2,
    reservation_date: "",
    reservation_time: "19:00",
    requests: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm({ ...form, [k]: v });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await submit({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          party_size: Number(form.party_size),
          reservation_date: form.reservation_date,
          reservation_time: form.reservation_time,
          requests: form.requests.trim() || null,
        },
      });
      setEmailed(result.emailed);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit reservation. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading
            eyebrow="Reservations"
            title="Reserve Your Table"
            description="Tell us when you'd like to join us — you'll receive an email confirmation right away."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-8 grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden min-h-[300px]">
            <img src={img4.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
            <div className="relative p-8 h-full flex flex-col justify-end">
              <h3 className="font-display text-2xl">A Few Things</h3>
              <ul className="mt-4 space-y-2 text-sm text-foreground/85">
                <li className="flex gap-2">
                  <Calendar className="text-gold shrink-0" size={16} /> Open daily 8:00 AM — 10:00
                  PM
                </li>
                <li className="flex gap-2">
                  <Clock className="text-gold shrink-0" size={16} /> Confirmation email sent
                  instantly
                </li>
                <li className="flex gap-2">
                  <Users className="text-gold shrink-0" size={16} /> Groups of 10+ — please call us
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3 rounded-xl border border-border bg-card p-8 md:p-10">
            {submitted ? (
              <div className="text-center py-12 animate-fade-up">
                <div className="mx-auto h-16 w-16 rounded-full bg-gold/15 grid place-items-center mb-5">
                  <Check className="text-gold" size={32} />
                </div>
                <h3 className="font-display text-3xl">Reservation Received</h3>
                <p className="mt-3 text-muted-foreground">
                  {emailed ? (
                    <>
                      Thank you! We've sent a confirmation to{" "}
                      <strong className="text-gold">{form.email}</strong>. Your request is with our
                      team for review and we'll be in touch shortly to finalise your table.
                    </>
                  ) : (
                    <>
                      Thank you! Your request has been sent to our team for review — we'll contact
                      you at <strong className="text-gold">{form.email}</strong> shortly to finalise
                      your table.
                    </>
                  )}
                </p>
                <button
                  onClick={() => {
                    setEmailed(null);
                    setForm({
                      name: "",
                      email: "",
                      phone: "",
                      party_size: 2,
                      reservation_date: "",
                      reservation_time: "19:00",
                      requests: "",
                    });
                  }}
                  className="mt-8 btn-outline-gold rounded-full px-6 py-2.5 text-sm"
                >
                  Make Another Booking
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field label="Guests">
                  <select
                    required
                    value={form.party_size}
                    onChange={(e) => update("party_size", Number(e.target.value))}
                    className={input}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date">
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.reservation_date}
                    onChange={(e) => update("reservation_date", e.target.value)}
                    className={input}
                  />
                </Field>
                <Field label="Time">
                  <select
                    required
                    value={form.reservation_time}
                    onChange={(e) => update("reservation_time", e.target.value)}
                    className={input}
                  >
                    {[
                      "08:00",
                      "10:00",
                      "12:00",
                      "13:00",
                      "14:00",
                      "18:00",
                      "19:00",
                      "20:00",
                      "21:00",
                    ].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Special Requests" full>
                  <textarea
                    rows={4}
                    value={form.requests}
                    onChange={(e) => update("requests", e.target.value)}
                    placeholder="Birthday, dietary needs, seating preference…"
                    className={input + " resize-none"}
                  />
                </Field>
                {error && (
                  <div className="md:col-span-2 text-sm text-red-400 border border-red-500/30 bg-red-500/10 rounded-md p-3">
                    {error}
                  </div>
                )}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-gold w-full rounded-full py-3.5 text-sm font-semibold tracking-wide disabled:opacity-60"
                  >
                    {busy ? "Sending…" : "Confirm Reservation"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const input =
  "w-full bg-secondary rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50 transition";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
        {label}
      </span>
      {children}
    </label>
  );
}
