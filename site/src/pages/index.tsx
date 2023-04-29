import Head from "next/head";
import EventSearch from "@components/search/EventSearch";
import HeaderBar from "@components/HeaderBar";
import FooterBar from "@components/FooterBar";

export default function Home() {
  return (
    <>
      <Head>
        <title>TixTrend</title>
        <meta name="description" content="TixTrend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar />
        <EventSearch />
        <FooterBar />
      </div>
    </>
  );
}
