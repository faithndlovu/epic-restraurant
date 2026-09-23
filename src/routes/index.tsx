import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Star, ChefHat, Utensils, Wine, Clock } from "lucide-react";
import {
  mixedGrill as hero,
  breakfast as img3,
  brownPlate as img4,
  pizza as img5,
} from "@/assets/images";
import { menu } from "@/data/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Epic Restaurant — Exceptional Dining in Bulawayo" },
      {
        name: "description",
        content:
          "Where Zimbabwean tradition meets modern fine dining. Signature steaks, pizzas, and an unforgettable atmosphere in the heart of Bulawayo.",
      },
      { property: "og:title", content: "Epic Restaurant — Exceptional Dining in Bulawayo" },
      {
        property: "og:description",
        content: "Where Zimbabwean tradition meets modern fine dining.",
      },
      { property: "og:url", content: "/" },
      { property: "og:image", content: hero.url },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

type Featured = { id: string; name: string; price: number; image: string; tag?: string | null };

// What the server renders, and what stays on screen if the live fetch fails.
// Without it the section would flash empty on every load and disappear entirely
// for crawlers, which is worse than a few seconds of slightly stale dishes.
const FALLBACK_FEATURED: Featured[] = menu
  .filter((m) => ["m1", "m2", "m3", "d2"].includes(m.id))
  .map((m) => ({ id: m.id, name: m.name, price: m.price, image: m.image, tag: m.tag }));

function Home() {
  const [featured, setFeatured] = useState<Featured[]>(FALLBACK_FEATURED);

  // The full menu at /menu reads menu_items, so the homepage has to as well —
  // otherwise editing a dish in the admin console leaves the front page showing
  // the old one, which is the first thing anyone tries after an edit.
  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id,name,price,image_url,tag,sort_order")
      .eq("is_available", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (error || !data?.length) return;
        // Tagged dishes are the ones staff marked as specials, so they lead.
        const tagged = data.filter((d) => d.tag);
        const untagged = data.filter((d) => !d.tag);
        setFeatured(
          [...tagged, ...untagged].slice(0, 4).map((d) => ({
            id: d.id,
            name: d.name,
            price: Number(d.price),
            image: d.image_url ?? "",
            tag: d.tag,
          })),
        );
      });
  }, []);

  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative -mt-20 min-h-[100vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero.url}
            alt="Signature mixed grill at Epic Restaurant"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/85 via-charcoal/60 to-charcoal" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/40 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8 pt-32 pb-20 w-full">
          <div className="max-w-3xl animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-gold" />
              <span className="text-xs tracking-[0.4em] uppercase text-gold">
                Est. 2022 · Bulawayo
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-foreground">
              Experience{" "}
              <span className="font-script text-gold-gradient font-normal">Exceptional</span>
              <br />
              Dining at Epic Restaurant
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-xl leading-relaxed">
              Vibrant flavors of Zimbabwe, generously plated and elegantly served. Quality food,
              warm service, and unforgettable moments — every visit.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/reservations"
                className="btn-gold rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide inline-flex items-center gap-2"
              >
                Book a Table <ArrowRight size={16} />
              </Link>
              <Link
                to="/menu"
                className="btn-outline-gold rounded-full px-8 py-3.5 text-sm font-semibold tracking-wide"
              >
                View Menu
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-gold/80">
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <span className="h-10 w-px bg-gold/60" />
        </div>
      </section>

      {/* HIGHLIGHTS / STATS */}
      <section className="border-y border-border bg-charcoal/40">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 px-6 md:px-8">
          {/* Every figure here is checkable against a public source. The strip
              used to read "60+ Signature Dishes / 10k+ Plates Served / 4.6 Guest
              Rating", none of which was true — the menu holds 13 dishes and no
              rating had been collected. */}
          {[
            { icon: ChefHat, value: "Tshisanyama", label: "Grills & Premium Cuts" },
            { icon: Utensils, value: "13.8k", label: "Facebook Followers" },
            { icon: Clock, value: "8AM – 10PM", label: "Open Every Day" },
            { icon: Star, value: "Since 2022", label: "Serving Bulawayo" },
          ].map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="py-10 text-center border-r last:border-r-0 border-border/40"
            >
              <Icon className="mx-auto mb-3 text-gold" size={28} />
              <div className="font-display text-3xl md:text-4xl text-foreground">{value}</div>
              <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-gold" />
              <span className="text-xs tracking-[0.35em] uppercase text-gold">Our Philosophy</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Where local tradition meets <span className="text-gold-gradient">modern dining</span>.
            </h2>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              Epic Restaurant is a delightful spot in Bulawayo offering a variety of well-prepared
              dishes that have made us a favorite among food lovers. From our signature epic pizza
              to hearty chicken and chips, succulent beef steak and fresh hake — every plate is a
              celebration.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our chefs marry Zimbabwean heritage with global technique, creating generous portions
              and flavors that bring guests back, again and again.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex items-center gap-2 text-gold hover:gap-3 transition-all"
            >
              Our Story <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src={img3.url}
              alt="Hearty breakfast plate"
              className="rounded-lg aspect-[3/4] object-cover shadow-luxe"
              style={{ boxShadow: "var(--shadow-luxe)" }}
            />
            <img
              src={img4.url}
              alt="Cappuccino & brown plate"
              className="rounded-lg aspect-[3/4] object-cover translate-y-8"
              style={{ boxShadow: "var(--shadow-luxe)" }}
            />
          </div>
        </div>
      </section>

      {/* FEATURED DISHES */}
      <section className="py-24 bg-gradient-to-b from-background to-charcoal">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading
            eyebrow="Featured"
            title="Signature Dishes"
            description="A curated taste of our most-loved plates — from chef specials to local classics."
          />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((item) => (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-gold/50 transition-all duration-500"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-90" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {item.tag && (
                    <span className="inline-block text-[10px] tracking-[0.25em] uppercase text-gold mb-2">
                      {item.tag}
                    </span>
                  )}
                  <h3 className="font-display text-xl text-foreground">{item.name}</h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-gold text-lg font-medium">${item.price.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">View →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/menu"
              className="btn-outline-gold rounded-full px-8 py-3 text-sm font-medium inline-flex items-center gap-2"
            >
              Full Menu <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHAT EPIC IS KNOWN FOR */}
      {/* This was a "What Our Guests Say" block holding three invented guest
          quotes — "Tendai M.", "Sarah K." and "Brian N." — each under a row of
          five gold stars. None of those people exist. It now carries what the
          restaurant actually says about itself on its own channels, and sends
          anyone who wants opinions to the real reviews. */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading
            eyebrow="On the Corner of 12th & Jason Moyo"
            title="What Epic Is Known For"
          />
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ChefHat,
                title: "Fine Dining & Tshisanyama",
                body: "Premium cuts, flame-grilled tshisanyama and a full fine-dining menu — all under one roof.",
              },
              {
                icon: Utensils,
                title: "Local & International",
                body: "Zimbabwean classics like sadza and beef stew sit alongside pizzas, grills and all-day breakfast.",
              },
              {
                icon: Clock,
                title: "Open Every Day",
                body: "Breakfast, lunch and dinner from 8AM to 10PM, seven days a week, in the heart of the city.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-8 hover:border-gold/50 transition"
              >
                <div className="h-11 w-11 rounded-full bg-gold/10 grid place-items-center text-gold">
                  <Icon size={18} />
                </div>
                <h3 className="mt-5 font-display text-xl">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="https://www.facebook.com/p/Epic-Restaurant-Bulawayo-100086311914355/"
              target="_blank"
              rel="noreferrer"
              className="btn-outline-gold rounded-full px-8 py-3 text-sm font-medium inline-flex items-center gap-2"
            >
              Read Guest Reviews on Facebook <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="py-24 bg-charcoal">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <SectionHeading eyebrow="Gallery" title="A Taste of the Experience" />
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[img3, img4, img5, hero].map((g, i) => (
              <Link
                key={i}
                to="/gallery"
                className="group overflow-hidden rounded-lg aspect-square block"
              >
                <img
                  src={g.url}
                  alt="Gallery preview"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/gallery"
              className="text-gold hover:text-gold-bright inline-flex items-center gap-2"
            >
              View full gallery <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img src={img4.url} alt="" className="h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/85 to-charcoal" />
        </div>
        <div className="relative mx-auto max-w-3xl text-center px-6">
          <Wine className="mx-auto text-gold mb-6" size={36} />
          <h2 className="font-display text-4xl md:text-6xl">
            Reserve Your <span className="text-gold-gradient">Table</span>
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            Whether it's a quiet dinner for two or a celebration for the whole family, we'd be
            honored to host you.
          </p>
          <Link
            to="/reservations"
            className="mt-8 inline-flex btn-gold rounded-full px-10 py-3.5 text-sm font-semibold tracking-wide"
          >
            Book Your Experience
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
