export const RESTAURANT_INFO = {
  name: "Epic Restaurant",
  description:
    "Vibrant Zimbabwean flavors, signature steaks, pizzas, and an unforgettable atmosphere in the heart of Bulawayo.",
  url: "/",
  telephone: "+263-29-2222-222",
  email: "hello@epicrestaurant.test",
  streetAddress: "12 Main Street",
  addressLocality: "Bulawayo",
  addressRegion: "Bulawayo",
  postalCode: "00000",
  addressCountry: "ZW",
  priceRange: "$$",
  servesCuisine: ["Zimbabwean", "International", "Grill", "Breakfast"],
  openingHours: "Mo-Su 08:00-22:00",
  geo: { latitude: -20.1532, longitude: 28.5891 },
  sameAs: ["https://www.facebook.com/epicrestaurant", "https://www.instagram.com/epicrestaurant"],
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
      postalCode: RESTAURANT_INFO.postalCode,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      reviewCount: "120",
    },
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
