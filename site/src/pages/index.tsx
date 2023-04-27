import Head from "next/head";
import EventSearch from "@components/search/EventSearch";

export default function Home() {
  return (
    <>
      <Head>
        <title>TixTrend</title>
        <meta name="description" content="TixTrend" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="border-b border-gray-700 mb-3">
        <h1 className="text-4xl px-5 py-2">TixTrend</h1>
      </div>
      <EventSearch />
    </>
  );
}
