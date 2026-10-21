import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { LanguageProvider } from "../lib/i18n";

function NotFoundComponent() {
  return (
    <div className="surface-dark flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="display-xl text-brand">404</h1>
        <h2 className="mt-4 font-display text-2xl text-on-dark">Page not found</h2>
        <p className="mt-2 text-sm text-on-dark-muted">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="btn-base btn-primary">
            Go home
          </Link>
          <Link to="/equipment" className="btn-base btn-glass">
            Browse equipment
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-xl text-center">
        <h1 className="font-display text-2xl text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-4 p-4 bg-red-50 text-red-900 text-xs text-left rounded-xl border border-red-200 overflow-auto max-h-60 font-mono shadow-xs">
          <p className="font-bold text-red-700">{(error as any)?.message || String(error)}</p>
          {(error as any)?.stack && (
            <pre className="mt-2 text-[10px] whitespace-pre-wrap opacity-80">{(error as any).stack}</pre>
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-base btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-base btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "google-site-verification",
        content: "zekq5A0tscZGD4daC0BTSbzqQ06iKVX3oyb7euTqP0s",
      },
      { title: "M3 Rental | Equipment & Vehicle Rentals in Houston, TX" },
      {
        name: "description",
        content:
          "M3 Rental rents vehicles, trucks, trailers, construction and specialty equipment in Houston, TX. Cash, Zelle, Cash App and Stripe accepted. Operator available on selected equipment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
      { rel: "icon", href: "/fav.png", type: "image/png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/fav.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="zekq5A0tscZGD4daC0BTSbzqQ06iKVX3oyb7euTqP0s"
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster />
        <Analytics />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
