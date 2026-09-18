import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import { Heart, Leaf, Sparkles, Users } from "lucide-react";
import { mixedGrill, staff, pizza, cakes, drinks } from "@/assets/images";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Epic Restaurant" },
      {
        name: "description",
        content: "Discover the story, mission and people behind Epic Restaurant in Bulawayo.",
      },
      { property: "og:title", content: "About — Epic Restaurant" },
      {
        property: "og:description",
        content: "Discover the story, mission and people behind Epic Restaurant in Bulawayo.",
      },
      { property: "og:url", content: "/about" },
      { property: "og:image", content: mixedGrill.url },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <section className="relative py-24 md:py-32 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="flex items-center gap-3 mb-5 justify-center">
            <span className="h-px w-10 bg-gold" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold">Our Story</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            Crafted with <span className="font-script text-gold-gradient font-normal">passion</span>
            ,<br /> served with pride.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Since 2022, Epic Restaurant has been a culinary landmark in Bulawayo — a place where
            generous Zimbabwean hospitality meets bold, modern cooking.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid md:grid-cols-2 gap-16 items-center">
          <img
            src={mixedGrill.url}
            alt="A signature plate at Epic Restaurant"
            className="rounded-xl aspect-[4/5] object-cover"
            style={{ boxShadow: "var(--shadow-luxe)" }}
          />
          <div>
            <SectionHeading
              eyebrow="Our Journey"
              title="Built on flavor and family."
              align="left"
            />
            <p className="mt-6 text-muted-foreground leading-relaxed">
              What began as a humble idea between friends has grown into a beloved diner serving
              hundreds of guests each week. We believe great food brings people together — and that
              every plate should tell a story.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              From the sizzle of our grills to the aroma of fresh-baked pastries, our kitchen is
              alive with craft, care, and a deep love for the cuisine we serve.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid md:grid-cols-2 gap-10">
          {[
            {
              icon: Sparkles,
              title: "Our Mission",
              body: "To delight every guest with thoughtfully prepared meals, warm service, and an atmosphere that turns ordinary visits into lasting memories.",
            },
            {
              icon: Heart,
              title: "Our Vision",
              body: "To be Bulawayo's most loved dining destination — celebrated for honoring local heritage while pushing the craft of modern hospitality forward.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-10">
              <Icon className="text-gold mb-4" size={28} />
              <h3 className="font-display text-2xl mb-3">{title}</h3>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1">
            <SectionHeading eyebrow="The Kitchen" title="Meet our Head Chef" align="left" />
            <p className="mt-6 text-muted-foreground leading-relaxed">
              With over a decade of experience across Southern Africa, our head chef leads a team
              devoted to flavor, precision and warmth. Every dish that leaves our pass carries the
              signature of a kitchen that genuinely loves what it does.
            </p>
            <blockquote className="mt-6 border-l-2 border-gold pl-6 text-foreground/90 font-display text-xl italic">
              "We don't just cook food — we craft moments worth remembering."
            </blockquote>
          </div>
          <img
            src={staff.url}
            alt="The Epic Restaurant team"
            className="order-1 md:order-2 rounded-xl aspect-square object-cover"
            style={{ boxShadow: "var(--shadow-luxe)" }}
          />
        </div>
      </section>

      <section className="py-20 bg-charcoal border-y border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading eyebrow="What we stand for" title="Our Values" />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                t: "Fresh & Local",
                d: "Sourcing the best produce our region has to offer.",
              },
              {
                icon: Heart,
                t: "Warm Hospitality",
                d: "Every guest treated like family from arrival to farewell.",
              },
              {
                icon: Sparkles,
                t: "Crafted Plates",
                d: "Generous portions, thoughtfully prepared, beautifully presented.",
              },
              {
                icon: Users,
                t: "Community",
                d: "Proud to be part of the Bulawayo story since 2022.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div
                key={t}
                className="rounded-xl bg-background border border-border p-6 hover:border-gold/50 transition"
              >
                <Icon className="text-gold mb-3" size={22} />
                <h4 className="font-display text-lg">{t}</h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-3 gap-3">
          <img
            src={pizza.url}
            alt="Epic signature pizza"
            className="aspect-square object-cover rounded-lg"
          />
          <img
            src={cakes.url}
            alt="Celebration cakes"
            className="aspect-square object-cover rounded-lg"
          />
          <img
            src={drinks.url}
            alt="Signature drinks"
            className="aspect-square object-cover rounded-lg"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
