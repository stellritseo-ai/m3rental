import { Boxes, MapPin, UserCheck, WalletCards } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const heroStats = [
  {
    icon: Boxes,
    value: "70+",
    label: "Rental Products",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 text-[#0040DD]",
  },
  {
    icon: MapPin,
    value: "Houston",
    label: "Based in Houston, TX",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 text-[#16A34A]",
  },
  {
    icon: WalletCards,
    value: "Flexible",
    label: "Payment Options",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 text-[#F59E0B]",
  },
  {
    icon: UserCheck,
    value: "Operator",
    label: "Available on Selected Machinery",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 text-[#0040DD]",
  },
];

export function HeroStatsSection() {
  return (
    <section className="relative z-10 -mt-16 sm:-mt-20 lg:-mt-24">
      <div className="container-x">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {heroStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 80}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-4"
            >
              <div className={`grid size-12 shrink-0 place-items-center rounded-xl ${stat.bg}`}>
                <stat.icon className="size-6" />
              </div>
              <div>
                <p className={`font-display text-3xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-wider text-slate-600">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
