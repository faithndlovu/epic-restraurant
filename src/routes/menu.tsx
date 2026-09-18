import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { menuJsonLd } from "@/lib/structured-data";

const categories = ["Starters", "Main Courses", "Desserts", "Drinks"] as const;
type Category = (typeof categories)[number];

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  tag: string | null;
  sort_order: number;
};

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Epic Restaurant" },
      {
        name: "description",
        content:
          "Explore our full menu — starters, mains, desserts and drinks crafted with care in Bulawayo.",
      },
      { property: "og:title", content: "Menu — Epic Restaurant" },
      {
        property: "og:description",
        content: "Explore our full menu — starters, mains, desserts and drinks crafted with care.",
      },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id,name,description,price,image_url,category,tag,sort_order")
      .eq("is_available", true)
      .order("category")
      .order("sort_order")
      .then(({ data, error }) => {
        // Without this an RLS/permission failure is indistinguishable from an
        // empty menu — the page just renders "No dishes".
        if (error) setError(error.message);
        else setItems((data ?? []) as Item[]);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return items.filter((m) => {
      const matchCat = active === "All" || m.category === active;
      const matchQ =
        !query || (m.name + " " + m.description).toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [items, active, query]);

  return (
    <SiteLayout>
      {/* Items load client-side, so on SSR this would emit an empty menu to
          crawlers. Only render the structured data once we actually have items. */}
      {items.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd(items)) }}
        />
      )}
      <section className="py-20 md:py-28 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8 text-center">
          <SectionHeading
            eyebrow="The Menu"
            title="Plates Worth Returning For"
            description="Bold flavors, generous portions, and an offering that celebrates both heritage and craft."
          />
        </div>
      </section>

      <section className="py-12 sticky top-20 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(["All", ...categories] as const).map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`px-5 py-2 rounded-full text-sm tracking-wide transition border ${
                  active === c
                    ? "bg-gold text-charcoal border-gold"
                    : "border-border text-muted-foreground hover:text-gold hover:border-gold/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the menu…"
              className="w-full bg-secondary rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {loading ? (
            <p className="text-center text-muted-foreground py-20">Loading menu…</p>
          ) : error ? (
            <div className="mx-auto max-w-lg rounded-md border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-300">
              We couldn't load the menu right now. Please try again shortly.
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No dishes match your search.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <article
                  key={item.id}
                  className="group rounded-xl overflow-hidden bg-card border border-border hover:border-gold/50 transition-all duration-500"
                >
                  {item.image_url && (
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {item.tag && (
                        <span className="absolute top-3 left-3 text-[10px] tracking-[0.2em] uppercase bg-gold text-charcoal px-2.5 py-1 rounded-full">
                          {item.tag}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-baseline gap-4">
                      <h3 className="font-display text-xl">{item.name}</h3>
                      <span className="text-gold font-medium">
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-1">
                      {item.category}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
