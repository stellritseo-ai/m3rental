import { useLanguage, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Check, Globe } from "lucide-react";

/**
 * High-definition crisp vector SVG of the United States Flag
 */
export function USAFlag({ className }: { className?: string | undefined } = {}) {
  return (
    <svg
      viewBox="0 0 640 480"
      className={cn("rounded-[2px] shadow-2xs border border-black/15 shrink-0 object-cover", className)}
      aria-label="United States Flag"
      aria-hidden="true"
    >
      <g fillRule="evenodd">
        {/* 13 Red & White Stripes */}
        <path fill="#bd3d44" d="M0 0h640v480H0z" />
        <path
          stroke="#fff"
          strokeWidth="37"
          d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"
        />
        {/* Blue Canton */}
        <path fill="#192f5d" d="M0 0h296v259H0z" />
        {/* Crisp Stars Array */}
        <g fill="#fff">
          <g id="us-s18">
            <g id="us-s9">
              <g id="us-s5">
                <g id="us-s4">
                  <path id="us-s" d="M24.7 9.8l-8.4 25.8 22-16H11.1l22 16z" />
                  <use href="#us-s" x="49.3" />
                  <use href="#us-s" x="98.7" />
                  <use href="#us-s" x="148" />
                </g>
                <use href="#us-s" x="197.3" />
              </g>
              <use href="#us-s4" x="24.7" y="21.6" />
            </g>
            <use href="#us-s9" y="43.2" />
          </g>
          <use href="#us-s18" y="86.4" />
          <use href="#us-s9" y="172.8" />
        </g>
      </g>
    </svg>
  );
}

/**
 * High-definition crisp vector SVG of the Flag of Spain
 */
export function SpainFlag({ className }: { className?: string | undefined } = {}) {
  return (
    <svg
      viewBox="0 0 640 480"
      className={cn("rounded-[2px] shadow-2xs border border-black/15 shrink-0 object-cover", className)}
      aria-label="Spain Flag"
      aria-hidden="true"
    >
      {/* Red, Yellow (double height), Red Stripes */}
      <path fill="#c60b1e" d="M0 0h640v480H0z" />
      <path fill="#ffc400" d="M0 120h640v240H0z" />
      {/* Spanish Heraldic Crest Emblem */}
      <g transform="translate(150, 240) scale(0.68)">
        {/* Crown */}
        <path fill="#c60b1e" d="M-40 -120h80v20h-80z" />
        <circle cx="-35" cy="-135" r="11" fill="#ffc400" />
        <circle cx="0" cy="-145" r="13" fill="#ffc400" />
        <circle cx="35" cy="-135" r="11" fill="#ffc400" />
        {/* Shield */}
        <path fill="#c60b1e" d="M-46 -90h92v92c0 36 -46 64 -46 64s-46 -28 -46 -64z" />
        <path fill="#ffc400" d="M-38 -82h76v76c0 28 -38 52 -38 52s-38 -24 -38 -52z" />
        <path fill="#c60b1e" d="M-38 -82h38v38h-38zM0 -44h38v38h-38z" />
        {/* Pillars of Hercules */}
        <path fill="#ffffff" d="M-80 -85h18v170h-18zM62 -85h18v170h-18z" />
        <path fill="#ffc400" d="M-85 -95h28v10h-28zM57 -95h28v10h-28z" />
        <path fill="#c60b1e" d="M-88 -20h34v15h-34zM54 -20h34v15h-34z" />
      </g>
    </svg>
  );
}

/** Flag renderer based on language code */
export function FlagIcon({ lang, className }: { lang: Language; className?: string | undefined }) {
  if (lang === "es") {
    return <SpainFlag className={className} />;
  }
  return <USAFlag className={className} />;
}

/**
 * Top Utility Bar Language Selector (Direct English & Spanish Toggle with Flags & Names)
 * Positioned right after the phone number in Header.tsx
 */
export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center gap-1 bg-white/10 p-0.5 sm:p-1 rounded-full border border-white/20 shadow-2xs notranslate"
      translate="no"
      role="group"
      aria-label="Language selection: English or Spanish"
    >
      {/* ── English Option (Default) ── */}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        title="English / Default"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95",
          language === "en"
            ? "bg-[#0040DD] text-white shadow-xs ring-1 ring-white/30"
            : "text-slate-300 hover:text-white hover:bg-white/10",
        )}
      >
        <USAFlag className="w-4 h-2.5 sm:w-4.5 sm:h-3" />
        <span className="hidden xs:inline">English</span>
        <span className="xs:hidden">EN</span>
      </button>

      {/* ── Spanish Option ── */}
      <button
        type="button"
        onClick={() => setLanguage("es")}
        aria-pressed={language === "es"}
        title="Español / Spanish"
        className={cn(
          "inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer select-none active:scale-95",
          language === "es"
            ? "bg-[#0040DD] text-white shadow-xs ring-1 ring-white/30"
            : "text-slate-300 hover:text-white hover:bg-white/10",
        )}
      >
        <SpainFlag className="w-4 h-2.5 sm:w-4.5 sm:h-3" />
        <span className="hidden xs:inline">Español</span>
        <span className="xs:hidden">ES</span>
      </button>
    </div>
  );
}

/**
 * Mobile Drawer Language Switcher (Segmented Pill Toggle)
 * Rendered inside the mobile drawer menu so mobile users have instant 1-tap language switching
 */
export function MobileLanguageToggle() {
  const { language, setLanguage, languages } = useLanguage();

  return (
    <div
      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2.5 notranslate"
      translate="no"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-[#0040DD]" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-800">
            Language / Idioma
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase">
          {language === "en" ? "English (Default)" : "Español (Activo)"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
        {languages.map((item) => {
          const isSelected = item.code === language;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code)}
              className={cn(
                "flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95",
                isSelected
                  ? "bg-[#0040DD] text-white shadow-xs font-black"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <FlagIcon lang={item.code} className="w-4.5 h-3" />
              <span>{item.nativeName}</span>
              {isSelected && <Check className="size-3.5 text-[#F59E0B]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
