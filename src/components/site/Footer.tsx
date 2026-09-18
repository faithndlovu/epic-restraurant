import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { logo } from "@/assets/images";

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-charcoal">
      <div className="hairline" />
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="Epic Restaurant"
              className="h-14 w-14 rounded-full ring-1 ring-gold/40"
            />
            <div>
              <div className="font-display text-xl text-gold-gradient">Epic Restaurant</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Est. 2022
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            The finest diner in town — vibrant flavors of Zimbabwe where local tradition meets
            modern dining.
          </p>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-[0.25em] text-gold mb-4">Visit</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <MapPin size={16} className="text-gold mt-0.5 shrink-0" /> 12th Avenue & Jason Moyo,
              Bulawayo, Zimbabwe
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="text-gold mt-0.5 shrink-0" /> 078 946 1108
            </li>
            <li className="flex gap-2">
              <Mail size={16} className="text-gold mt-0.5 shrink-0" /> epicrestaurant22@gmail.com
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-[0.25em] text-gold mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            {[
              ["/menu", "Menu"],
              ["/about", "Our Story"],
              ["/gallery", "Gallery"],
              ["/reservations", "Reservations"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-muted-foreground hover:text-gold transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm uppercase tracking-[0.25em] text-gold mb-4">Newsletter</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Be first to know about chef specials and events.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              (e.target as HTMLFormElement).reset();
            }}
            className="flex"
          >
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-l-full bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold"
            />
            <button className="btn-gold rounded-r-full px-4 text-sm font-medium">Join</button>
          </form>
          <div className="mt-6 flex gap-3">
            <a
              href="https://instagram.com/epic.11.2022"
              aria-label="Instagram"
              className="h-10 w-10 grid place-items-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="h-10 w-10 grid place-items-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-charcoal transition"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Epic Restaurant Bulawayo. All rights reserved.
      </div>
    </footer>
  );
}
