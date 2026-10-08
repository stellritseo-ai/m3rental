import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { site } from "@/lib/site";

export function MobileCallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl shadow-[0_-8px_25px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="flex gap-2.5">
        <a
          href={site.phoneHref}
          className="btn-base btn-outline flex-1 font-extrabold border-slate-300 text-slate-800 hover:text-[#0040DD]"
        >
          <Phone className="size-4 text-[#16A34A]" />
          <span>Call Now</span>
        </a>
        <Link
          to="/contact"
          search={{}}
          className="btn-base btn-primary flex-1 font-extrabold shadow-md"
        >
          <span>Request Rental</span>
        </Link>
      </div>
    </div>
  );
}
