export const RESTAURANT_INFO = {
  name: "Epic Restaurant",
  description:
    "Fine dining, premium cuts and tshisanyama under one roof — Zimbabwean and international dishes served daily on the corner of 12th Avenue and Jason Moyo, Bulawayo.",
  url: "/",
  // Keep these in step with the Footer and the Contact page — search engines
  // read this copy, visitors read those, and they used to disagree.
  telephone: "+263-78-946-1108",
  email: "epicrestaurant22@gmail.com",
  streetAddress: "12th Avenue & Jason Moyo",
  addressLocality: "Bulawayo",
  addressRegion: "Bulawayo",
  addressCountry: "ZW",
  priceRange: "$$",
  servesCuisine: ["Zimbabwean", "International", "Grill", "Breakfast"],
  openingHours: "Mo-Su 08:00-22:00",
  geo: { latitude: -20.1532, longitude: 28.5891 },
  // The restaurant's own public channels. epicrestaurant.co.zw appears in
  // search results but does not currently resolve, so it is left out.
  sameAs: [
    "https://www.instagram.com/epic.11.2022",
    "https://www.facebook.com/p/Epic-Restaurant-Bulawayo-100086311914355/",
  ],
};

export function restaurantJsonLd(image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: RESTAURANT_INFO.name,
    description: RESTAURANT_INFO.description,
    url: RESTAURANT_INFO.url,
    telephone: RESTAURANT_INFO.telephone,
    email: RESTAURANT_INFO.email,
    priceRange: RESTAURANT_INFO.priceRange,
    servesCuisine: RESTAURANT_INFO.servesCuisine,
    acceptsReservations: "True",
    image: image ? [image] : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: RESTAURANT_INFO.streetAddress,
      addressLocality: RESTAURANT_INFO.addressLocality,
      addressRegion: RESTAURANT_INFO.addressRegion,
      addressCountry: RESTAURANT_INFO.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: RESTAURANT_INFO.geo.latitude,
      longitude: RESTAURANT_INFO.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "08:00",
        closes: "22:00",
      },
    ],
    sameAs: RESTAURANT_INFO.sameAs,
    // No aggregateRating here on purpose. It used to claim 4.6 from 120 reviews,
    // which was invented — Google's structured-data policy requires ratings to
    // come from real reviews the site actually displays. Add it back when there
    // is a genuine source to point at.
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function menuJsonLd(
  items: { name: string; description: string; price: number; category: string }[],
) {
  const sections: Record<string, typeof items> = {};
  for (const it of items) (sections[it.category] ||= []).push(it);
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Epic Restaurant Menu",
    hasMenuSection: Object.entries(sections).map(([name, list]) => ({
      "@type": "MenuSection",
      name,
      hasMenuItem: list.map((i) => ({
        "@type": "MenuItem",
        name: i.name,
        description: i.description,
        offers: { "@type": "Offer", price: i.price.toFixed(2), priceCurrency: "USD" },
      })),
    })),
  };
}
