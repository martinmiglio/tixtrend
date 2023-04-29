import HeaderBar from "@components/page/HeaderBar";
import FooterBar from "@components/page/FooterBar";
import PageHeader from "@components/page/PageHeader";
import EventSearch from "@components/search/EventSearch";

export default function Home({ baseURL }: { baseURL: string }) {
  return (
    <>
      <PageHeader
        title="Tix Trend"
        description="Track ticket prices over time and never miss a deal again."
        url={baseURL + "/"}
      />
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar />
        <EventSearch />
        <FooterBar />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const baseURL = process.env.SITE_URL;
  return { props: { baseURL } };
}
