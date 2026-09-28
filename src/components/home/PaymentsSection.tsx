import { Banknote, CreditCard, ShieldCheck, Smartphone, Sparkles, Wallet } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const paymentCards = [
  {
    icon: Banknote,
    label: "Cash",
    sub: "Direct cash payment accepted upon pickup",
    color: "text-[#16A34A]",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    icon: Smartphone,
    label: "Zelle",
    sub: "Fast, fee-free bank-to-bank instant transfer",
    color: "text-[#7C3AED]",
    bg: "bg-purple-50 border-purple-200",
  },
  {
    icon: Wallet,
    label: "Cash App",
    sub: "Convenient mobile checkout in seconds",
    color: "text-[#059669]",
    bg: "bg-emerald-50 border-emerald-200",
  },
  {
    icon: CreditCard,
    label: "Stripe",
    sub: "Secure debit & credit card transactions",
    color: "text-[#0040DD]",
    bg: "bg-blue-50 border-blue-200",
  },
];

export function PaymentsSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-x text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#15803D] shadow-xs">
            <Sparkles className="size-3.5 text-[#16A34A]" />
            <span>Accessible Renting</span>
            <Sparkles className="size-3.5 text-[#16A34A]" />
          </div>
          <h2 className="display-lg mt-3 text-slate-900 font-black tracking-tight leading-tight">
            Simple, Accessible{" "}
            <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
              Payment Options
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
            No traditional credit card required. Choose the payment method that works best for your business or personal budget.
          </p>
        </Reveal>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paymentCards.map((card, index) => (
            <Reveal key={card.label} delay={index * 80}>
              <div className="card-premium flex h-full flex-col items-center text-center p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#0040DD]/30 transition-all duration-300">
                <span className={`grid size-16 place-items-center rounded-2xl border ${card.bg} ${card.color} shadow-xs`}>
                  <card.icon className="size-8" />
                </span>
                <p className="font-display text-2xl font-bold text-slate-900 mt-5">
                  {card.label}
                </p>
                <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                  {card.sub}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
