import FooterBar from "@/components/page/FooterBar";
import HeaderBar from "@/components/page/HeaderBar";
import { baseURL } from "@/consts";
import "@/styles/globals.css";
import Script from "next/script";
import { z } from "zod";

const schema = z.object({
  ANALYTICS_ID: z.string(),
});

const env = schema.parse(process.env);

const metadataBase = baseURL;
const iconURL = new URL("/favicon.ico", metadataBase);
const ogURL = new URL("/og?v1", metadataBase);

export const metadata = {
  title: {
    template: "%s | Tix Trend",
    default: "Tix Trend",
  },
  description: "Track ticket prices over time and never miss a deal again.",
  keywords: "Ticket, Price, Tracker, Concert, Sports, Theater, Music, Event",
  creator: "Martin Miglio",
  metadataBase,
  alternates: { canonical: "/" },
  icons: { icon: iconURL.toString() },
  twitter: {
    card: "summary_large_image",
    title: "Tix Trend",
    description: "Track ticket prices over time and never miss a deal again.",
    images: [ogURL.toString()],
  },
  openGraph: {
    type: "website",
    title: "Tix Trend",
    description: "Track ticket prices over time and never miss a deal again.",
    siteName: "Tix Trend",
    images: [
      {
        url: ogURL.toString(),
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://analytics.martinmiglio.dev/script.js"
          data-website-id={env.ANALYTICS_ID}
        />
      </head>
      <body className="bg-background text-primary overflow-x-clip">
        <div className="mx-auto flex h-[100dvh] min-h-screen w-full max-w-screen-xl flex-col p-4 md:py-8">
          <HeaderBar />
          <div className="flex-grow">{children}</div>
          <FooterBar />
        </div>
      </body>
    </html>
  );
}
