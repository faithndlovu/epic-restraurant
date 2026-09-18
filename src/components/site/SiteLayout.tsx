import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className="flex items-center gap-3 mb-4 justify-center">
          <span className="h-px w-8 bg-gold" />
          <span className="text-xs tracking-[0.35em] uppercase text-gold">{eyebrow}</span>
          <span className="h-px w-8 bg-gold" />
        </div>
      )}
      <h2 className="font-display text-4xl md:text-5xl text-foreground">{title}</h2>
      {description && (
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}
