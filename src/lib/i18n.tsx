import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";

export type Language = "en" | "es";

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  label: string;
  flagCode: string;
  sublabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    label: "English",
    flagCode: "US",
    sublabel: "Default (US)",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    label: "Español",
    flagCode: "ES",
    sublabel: "Spanish",
  },
];

const STORAGE_KEY = "m3_language";
const GOOGTRANS_COOKIE = "googtrans";

/**
 * Patch DOM methods so Google Translate's <font> tag injection
 * cannot trigger React 19 reconciliation errors (NotFoundError / parent mismatch).
 */
function patchReactDomForGoogleTranslate() {
  if (typeof window === "undefined" || typeof Node === "undefined") return;

  const nodeProto = Node.prototype as any;
  if (!nodeProto._m3Patched) {
    const originalRemoveChild = nodeProto.removeChild;
    nodeProto.removeChild = function <T extends Node>(child: T): T {
      if (child && child.parentNode !== this) {
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = nodeProto.insertBefore;
    nodeProto.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };

    nodeProto._m3Patched = true;
  }
}

/** Set cookie helper with root path and optional domain */
function setCookie(name: string, value: string, days?: number) {
  if (typeof document === "undefined") return;
  let expires = "";
  if (days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  const host = window.location.hostname;
  document.cookie = `${name}=${value}${expires}; path=/;`;
  if (host && host !== "localhost") {
    document.cookie = `${name}=${value}${expires}; path=/; domain=${host};`;
    const parts = host.split(".");
    if (parts.length > 2) {
      const rootDomain = "." + parts.slice(-2).join(".");
      document.cookie = `${name}=${value}${expires}; path=/; domain=${rootDomain};`;
    }
  }
}

/** Clear cookie helper */
function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  const host = window.location.hostname;
  const expired = "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = `${name}${expired}`;
  if (host && host !== "localhost") {
    document.cookie = `${name}${expired} domain=${host};`;
    const parts = host.split(".");
    if (parts.length > 2) {
      const rootDomain = "." + parts.slice(-2).join(".");
      document.cookie = `${name}${expired} domain=${rootDomain};`;
    }
  }
}

/** Read cookie */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match && match[3] ? decodeURIComponent(match[3]) : null;
}

/* ── Instant Translation Dictionaries for Header, Navigation & Core Elements ── */
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top Bar
    "topbar.location": "Houston, TX Rentals",
    "topbar.payment": "Cash • Zelle • Cash App",
    "topbar.options": "70+ Local Rental Options",
    "topbar.hours": "Mon–Sat: 7:00 AM – 7:00 PM",
    "topbar.call": "Call Direct",

    // Nav
    "nav.home": "Home",
    "nav.about": "About",
    "nav.equipment": "Equipment",
    "nav.sell": "Sell",
    "nav.howItWorks": "How It Works",
    "nav.whyM3": "Why M3",
    "nav.blog": "Blog",
    "nav.contact": "Contact",

    // Header Submenu
    "submenu.inventory": "Houston Equipment Inventory",
    "submenu.exploreAll": "Explore All 70+ Equipment",
    "submenu.needEquipment": "Need Equipment or an Operator Today?",
    "submenu.dispatch": "Houston dispatch • Cash, Zelle, Cash App & Cards accepted",
    "submenu.callNow": "Call Now",

    // Header CTAs
    "cta.contact": "Contact",
    "cta.call": "Call",
    "cta.searchPlaceholder": "Search equipment, trucks, guides...",
    "cta.rentOnline": "Rent Equipment Online",
    "cta.searchFleet": "Search equipment",
    "cta.viewCart": "View rental cart",
    "cta.language": "Language",
    "cta.yard": "Houston Yard: 6767 Long Dr, Houston, TX 77087",
    "cta.paymentAccepted": "Cash • Zelle • Cash App • Stripe Accepted",

    // Equipment Categories
    "cat.pickups": "Work Trucks & Pickups",
    "cat.pickupsDesc": "Half-ton to 1-ton crew cabs & heavy-duty haulers",
    "cat.trailers": "Hauling & Dump Trailers",
    "cat.trailersDesc": "Heavy equipment, utility, cargo & hydraulic dump trailers",
    "cat.construction": "Heavy Construction",
    "cat.constructionDesc": "Backhoe loaders, excavators & earthmoving machinery",
    "cat.operator": "Operator Included",
    "cat.operatorDesc": "Machinery provided with certified, skilled operators",
    "cat.vehicles": "Vehicles & Transport",
    "cat.vehiclesDesc": "Sedans, SUVs & passenger shuttle transportation",
    "cat.specialty": "Specialty & Utilities",
    "cat.specialtyDesc": "Bucket trucks, mobile LED trailers & utility gear",

    // Category Badges
    "badge.popular": "Popular",
    "badge.highDemand": "High Demand",
    "badge.heavyDuty": "Heavy-Duty",
    "badge.turnkey": "Turnkey",
    "badge.available": "Available",
    "badge.specialized": "Specialized",
  },
  es: {
    // Top Bar
    "topbar.location": "Alquileres en Houston, TX",
    "topbar.payment": "Efectivo • Zelle • Cash App",
    "topbar.options": "Más de 70 Opciones de Alquiler",
    "topbar.hours": "Lun–Sáb: 7:00 AM – 7:00 PM",
    "topbar.call": "Llamar Directo",

    // Nav
    "nav.home": "Inicio",
    "nav.about": "Nosotros",
    "nav.equipment": "Equipos",
    "nav.sell": "Vender",
    "nav.howItWorks": "Cómo Funciona",
    "nav.whyM3": "¿Por Qué M3?",
    "nav.blog": "Blog",
    "nav.contact": "Contacto",

    // Header Submenu
    "submenu.inventory": "Inventario de Equipos en Houston",
    "submenu.exploreAll": "Ver los 70+ Equipos",
    "submenu.needEquipment": "¿Necesita Equipo u Operador Hoy?",
    "submenu.dispatch": "Despacho en Houston • Efectivo, Zelle, Cash App y Tarjetas",
    "submenu.callNow": "Llamar Ahora",

    // Header CTAs
    "cta.contact": "Contacto",
    "cta.call": "Llamar",
    "cta.searchPlaceholder": "Buscar equipos, camiones, guías...",
    "cta.rentOnline": "Alquilar Equipos en Línea",
    "cta.searchFleet": "Buscar equipos",
    "cta.viewCart": "Ver carrito de alquiler",
    "cta.language": "Idioma",
    "cta.yard": "Patio en Houston: 6767 Long Dr, Houston, TX 77087",
    "cta.paymentAccepted": "Efectivo • Zelle • Cash App • Stripe Aceptados",

    // Equipment Categories
    "cat.pickups": "Camionetas y Camiones de Trabajo",
    "cat.pickupsDesc": "Cabinas dobles de 1/2 a 1 tonelada y transporte pesado",
    "cat.trailers": "Remolques de Carga y Volteo",
    "cat.trailersDesc": "Remolques de equipo pesado, carga y volteo hidráulico",
    "cat.construction": "Construcción Pesada",
    "cat.constructionDesc": "Retroexcavadoras, excavadoras y maquinaria de movimiento",
    "cat.operator": "Operador Incluido",
    "cat.operatorDesc": "Maquinaria suministrada con operadores calificados",
    "cat.vehicles": "Vehículos y Transporte",
    "cat.vehiclesDesc": "Sedanes, SUVs y transporte de pasajeros",
    "cat.specialty": "Especiales y Servicios",
    "cat.specialtyDesc": "Camiones con canastilla, remolques LED y utilitarios",

    // Category Badges
    "badge.popular": "Popular",
    "badge.highDemand": "Alta Demanda",
    "badge.heavyDuty": "Trabajo Pesado",
    "badge.turnkey": "Llave en Mano",
    "badge.available": "Disponible",
    "badge.specialized": "Especializado",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isSpanish: boolean;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (_k, fallback) => fallback || "",
  isSpanish: false,
  languages: LANGUAGES,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Triggers the Google Translate widget to translate the full page to the target language,
 * or reverts cleanly to English.
 */
function applyGoogleTranslate(targetLang: Language) {
  if (typeof window === "undefined") return;

  const triggerSelect = (combo: HTMLSelectElement) => {
    try {
      combo.value = targetLang === "es" ? "es" : "en";
      combo.dispatchEvent(new Event("change", { bubbles: true }));
      combo.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    } catch {
      return false;
    }
  };

  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    triggerSelect(select);
    return;
  }

  // If combo is not yet loaded, poll briefly
  let attempts = 0;
  const pollTimer = setInterval(() => {
    attempts++;
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      triggerSelect(combo);
      clearInterval(pollTimer);
    } else if (attempts > 40) {
      clearInterval(pollTimer);
    }
  }, 80);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default is English ("en")
  const [language, setLanguageState] = useState<Language>("en");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Initialize language from localStorage or cookie on client mount
  useEffect(() => {
    patchReactDomForGoogleTranslate();

    // Check stored preference
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "es" || stored === "en") {
        setLanguageState(stored);
      } else {
        // Check cookie
        const googtrans = getCookie(GOOGTRANS_COOKIE);
        if (googtrans && googtrans.includes("/es")) {
          setLanguageState("es");
        }
      }
    } catch {
      // Ignore localStorage access errors
    }
  }, []);

  // Initialize Google Translate element script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,es",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      } catch (err) {
        console.warn("Google translate element initialization skipped:", err);
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).google?.translate?.TranslateElement) {
      (window as any).googleTranslateElementInit();
    }
  }, []);

  // Sync html lang attribute and cookies whenever language changes
  const setLanguage = useCallback((lang: Language) => {
    const prevLang = language;
    setLanguageState(lang);

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}

    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }

    if (lang === "es") {
      setCookie(GOOGTRANS_COOKIE, "/en/es", 30);
      applyGoogleTranslate("es");
    } else {
      // Cleanly revert to English
      setCookie(GOOGTRANS_COOKIE, "/en/en", 30);
      clearCookie(GOOGTRANS_COOKIE);
      applyGoogleTranslate("en");

      // If switching from Spanish to English and Google Translate injected DOM elements,
      // a clean reload guarantees 100% spotless default English restoration
      if (prevLang === "es" && typeof document !== "undefined" && document.querySelector("font")) {
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    }
  }, [language]);

  // Sync on pathname change (TanStack Router SPA transitions)
  useEffect(() => {
    if (language === "es") {
      const timer = setTimeout(() => {
        applyGoogleTranslate("es");
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [pathname, language]);

  // Translation helper
  const t = useCallback(
    (key: string, fallback?: string): string => {
      const langDict = translations[language];
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isSpanish: language === "es",
        languages: LANGUAGES,
      }}
    >
      {children}
      {/* Hidden container for Google Translate element */}
      <div
        id="google_translate_element"
        style={{ display: "none" }}
        aria-hidden="true"
        className="notranslate"
      />
    </LanguageContext.Provider>
  );
}
