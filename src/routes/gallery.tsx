import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import {
  mixedGrill,
  breakfast,
  brownPlate,
  pizza,
  samosas,
  pies,
  sausageRolls,
  cakes,
  cakeSlice,
  muffins,
  iceCream,
  milkshake,
  drinks,
  staff,
} from "@/assets/images";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Epic Restaurant" },
      {
        name: "description",
        content:
          "A visual journey through our plates, ambiance and unforgettable moments at Epic Restaurant.",
      },
      { property: "og:title", content: "Gallery — Epic Restaurant" },
      { property: "og:description", content: "A visual journey through Epic Restaurant." },
      { property: "og:url", content: "/gallery" },
      { property: "og:image", content: mixedGrill.url },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

const images = [
  { src: mixedGrill.url, alt: "Signature mixed grill", h: "tall" },
  { src: breakfast.url, alt: "Epic big breakfast" },
  { src: pizza.url, alt: "Epic signature pizza", h: "tall" },
  { src: samosas.url, alt: "Golden samosas" },
  { src: brownPlate.url, alt: "Brown plate with cappuccino", h: "tall" },
  { src: cakeSlice.url, alt: "Decadent chocolate cake" },
  { src: drinks.url, alt: "Signature cocktails & mocktails", h: "tall" },
  { src: pies.url, alt: "Freshly baked pies" },
  { src: milkshake.url, alt: "Berry & chocolate milkshakes", h: "tall" },
  { src: staff.url, alt: "The Epic Restaurant team" },
  { src: sausageRolls.url, alt: "Sausage rolls", h: "tall" },
  { src: cakes.url, alt: "Celebration cakes" },
  { src: iceCream.url, alt: "Hand-scooped ice cream" },
  { src: muffins.url, alt: "Chocolate muffins", h: "tall" },
];

function Gallery() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <SiteLayout>
      <section className="py-20 md:py-28 bg-charcoal border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <SectionHeading
            eyebrow="Gallery"
            title="Moments on the Plate"
            description="A peek at the dishes, atmosphere and craft that define Epic Restaurant."
          />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setOpen(img.src)}
                className={`block w-full overflow-hidden rounded-lg group relative ${img.h === "tall" ? "aspect-[3/4]" : "aspect-square"}`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {open && (
        <div
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-up"
        >
          <button className="absolute top-6 right-6 text-gold p-2" aria-label="Close">
            <X size={28} />
          </button>
          <img src={open} alt="" className="max-h-[90vh] max-w-full rounded-lg shadow-2xl" />
        </div>
      )}
    </SiteLayout>
  );
}
