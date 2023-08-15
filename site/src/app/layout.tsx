import { GTagScript } from "@/components/scripts/GTag";
import { z } from "zod";
import "@/styles/globals.css";
import HeaderBar from "@/components/page/HeaderBar";
import FooterBar from "@/components/page/FooterBar";

const schema = z.object({
  GA_MEASUREMENT_ID: z.string(),
});
const env = schema.parse(process.env);

export const metadata = {
  title: {
    template: "%s | Tix Trend",
    default: "Tix Trend",
  },
  description: "Track ticket prices over time and never miss a deal again.",
  keywords: "Ticket, Price, Tracker, Concert, Sports, Theater, Music, Event",
  creator: "Martin Miglio",
  metadataBase: new URL("https://tixtrend.martinmiglio.dev/"),
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.ico" },
  twitter: {
    card: "summary_large_image",
    title: "Tix Trend",
    description: "Track ticket prices over time and never miss a deal again.",
    images: ["https://tixtrend.martinmiglio.dev/og?v1"],
  },
  openGraph: {
    type: "website",
    title: "Tix Trend",
    description: "Track ticket prices over time and never miss a deal again.",
    siteName: "Tix Trend",
    images: [
      {
        url: "https://tixtrend.martinmiglio.dev/og?v1",
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
        <GTagScript measurementId={env.GA_MEASUREMENT_ID} />
      </head>
      <body>
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <HeaderBar />
          {children}
          <FooterBar />
        </div>
      </body>
    </html>
  );
}
