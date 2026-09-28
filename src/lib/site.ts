export const site = {
  name: "M3 Rental",
  tagline: "Equipment Ready. Jobs Moving.",
  phone: "(281) 933-5000",
  phoneHref: "tel:+12819335000",
  email: "m3.wvalverse@gmail.com",
  emailHref: "mailto:m3.wvalverse@gmail.com",
  street: "11732 S Wilcrest Dr.",
  city: "Houston, TX 77099",
  mapsQuery: "11732 S Wilcrest Dr, Houston, TX 77099",
  payments: ["Cash", "Zelle", "Cash App", "Stripe"] as const,
};

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.mapsQuery,
)}`;

export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
  site.mapsQuery,
)}&output=embed`;
