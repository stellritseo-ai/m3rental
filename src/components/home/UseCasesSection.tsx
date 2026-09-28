import { CheckCircle2, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

const useCases = [
  "Commercial Construction",
  "Home Remodeling & Renovation",
  "Professional Landscaping",
  "Equipment & Materials Transportation",
  "Large Infrastructure Projects",
  "Outdoor Festivals & Special Events",
  "Electrical & Utility Work",
  "Heavy Debris & Dirt Hauling",
  "Site Clearing & Earthmoving",
  "Demolition & Excavation",
];

export function UseCasesSection() {
  return (
    <section className="section-pad bg-white">
      <div className="container-x">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#15803D] shadow-xs">
            <Sparkles className="size-3.5 text-[#16A34A]" />
            <span>Versatile Inventory</span>
            <Sparkles className="size-3.5 text-[#16A34A]" />
          </div>
          <h2 className="display-lg mt-3 text-slate-900 font-black tracking-tight leading-tight">
            Built for More Than One{" "}
            <span className="bg-gradient-to-r from-[#0040DD] to-[#16A34A] bg-clip-text text-transparent">
              Kind of Job
            </span>
          </h2>
          <p className="mt-3 max-w-2xl text-[13.5px] sm:text-base text-slate-600 font-medium leading-relaxed">
            Whether you are managing a municipal development or upgrading a backyard landscape, M3 Rental supplies the right machinery.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-3">
          {useCases.map((useCase, index) => (
            <Reveal key={useCase} delay={(index % 5) * 60}>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/80 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:border-[#0040DD] hover:bg-white hover:text-[#0040DD] hover:shadow-md transition-all duration-200 cursor-default">
                <Truck className="size-4 text-[#16A34A]" />
                {useCase}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
