import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Instagram, MessageCircle, Check } from "lucide-react";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Epic Restaurant" },
      {
        name: "description",
        content:
          "Get in touch with Epic Restaurant in Bulawayo. Visit us, call, or send a message.",
      },
      { property: "og:title", content: "Contact — Epic Restaurant" },
      { property: "og:description", content: "Get in touch with Epic Restaurant in Bulawayo." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading
            eyebrow="Say Hello"
            title="Get In Touch"
            description="We'd love to hear from you — for bookings, events, feedback or just to say hi."
          />
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid lg:grid-cols-3 gap-8">
          <div className="space-y-4 lg:col-span-1">
            {[
              {
                icon: MapPin,
                title: "Visit",
                body: "12th Avenue & Jason Moyo\nBulawayo, Zimbabwe",
              },
              { icon: Phone, title: "Call", body: "078 946 1108" },
              { icon: Mail, title: "Email", body: "epicrestaurant22@gmail.com" },
              { icon: Clock, title: "Hours", body: "Mon — Sun\n8:00 AM — 10:00 PM" },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 flex gap-4 hover:border-gold/50 transition"
              >
                <div className="h-11 w-11 shrink-0 rounded-full bg-gold/10 grid place-items-center text-gold">
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-display text-lg">{title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">{body}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/epic.11.2022"
                className="h-11 w-11 grid place-items-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="h-11 w-11 grid place-items-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-8 md:p-10">
            {sent ? (
              <div className="text-center py-12 animate-fade-up">
                <div className="mx-auto h-16 w-16 rounded-full bg-gold/15 grid place-items-center mb-5">
                  <Check className="text-gold" size={32} />
                </div>
                <h3 className="font-display text-3xl">Message Sent</h3>
                <p className="mt-3 text-muted-foreground">
                  Thanks for reaching out — we'll respond within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 btn-outline-gold rounded-full px-6 py-2.5 text-sm"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="grid md:grid-cols-2 gap-5"
              >
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Name
                  </span>
                  <input required className={input} />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Email
                  </span>
                  <input type="email" required className={input} />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Subject
                  </span>
                  <input required className={input} />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2 block">
                    Message
                  </span>
                  <textarea rows={5} required className={input + " resize-none"} />
                </label>
                <div className="md:col-span-2">
                  <button className="btn-gold rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide">
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="rounded-xl overflow-hidden border border-border aspect-[16/9] md:aspect-[21/9]">
            <iframe
              title="Epic Restaurant location map"
              src="https://www.google.com/maps?q=12th+Avenue+and+Jason+Moyo,+Bulawayo,+Zimbabwe&output=embed"
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

const input =
  "w-full bg-secondary rounded-md px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-gold border border-transparent focus:border-gold/50 transition";
