import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileCallBar } from "./MobileCallBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAF9] overflow-x-clip">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileCallBar />
      <CartDrawer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80 py-12 sm:py-16 lg:py-20">
      {/* Soft ambient glows */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#0040DD]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-[#16A34A]/10 blur-3xl" />

      <div className="container-x relative max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#0040DD]/20 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#0040DD] shadow-xs">
          {eyebrow}
        </span>
        <h1 className="font-display text-[26px] sm:text-[34px] md:text-[40px] font-black tracking-tight leading-tight text-slate-900 mt-4 sm:mt-5">
          {title}
        </h1>
        {description && (
          <p className="mt-3 sm:mt-4 max-w-2xl text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
