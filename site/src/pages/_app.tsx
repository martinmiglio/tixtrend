import "@styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { z } from "zod";
export { reportWebVitals } from "next-axiom";

const schema = z.object({
  ANALYTICS_ID: z.string(),
});

const env = schema.parse(process.env);
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        async
        strategy="lazyOnload"
        src="https://analytics.martinmiglio.dev/script.js"
        data-website-id={env.ANALYTICS_ID}
      />
      <Component {...pageProps} />
    </>
  );
}
