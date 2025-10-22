import FooterBar from "@/components/page/FooterBar";
import HeaderBar from "@/components/page/HeaderBar";
import { baseURL } from "@/consts";
import appCss from "@/styles/globals.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@tixtrend/ui/components/sonner";
import { z } from "zod";

const schema = z.object({
  ANALYTICS_ID: z.string().optional(),
});

const env = schema.parse(import.meta.env);

const metadataBase = baseURL;
const iconURL = new URL("/favicon.ico", metadataBase);
const ogURL = new URL("/og.png?v1", metadataBase);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tix Trend" },
      {
        name: "description",
        content: "Track ticket prices over time and never miss a deal again.",
      },
      {
        name: "keywords",
        content:
          "Ticket, Price, Tracker, Concert, Sports, Theater, Music, Event",
      },
      { name: "creator", content: "Martin Miglio" },
      // OpenGraph
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Tix Trend" },
      {
        property: "og:description",
        content: "Track ticket prices over time and never miss a deal again.",
      },
      { property: "og:site_name", content: "Tix Trend" },
      { property: "og:image", content: ogURL.toString() },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tix Trend" },
      {
        name: "twitter:description",
        content: "Track ticket prices over time and never miss a deal again.",
      },
      { name: "twitter:image", content: ogURL.toString() },
    ],
    links: [
      { rel: "canonical", href: metadataBase.toString() },
      { rel: "icon", href: iconURL.toString() },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        {env.ANALYTICS_ID && (
          <script
            async
            src="https://analytics.martinmiglio.dev/script.js"
            data-website-id={env.ANALYTICS_ID}
          />
        )}
      </head>
      <body className="bg-background text-primary overflow-x-clip">
        <QueryClientProvider client={queryClient}>
          <div className="mx-auto flex h-[100dvh] min-h-screen w-full max-w-screen-xl flex-col p-4 md:py-8">
            <HeaderBar />
            <div className="flex-grow">
              <Outlet />
            </div>
            <FooterBar />
          </div>
          <Toaster />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
