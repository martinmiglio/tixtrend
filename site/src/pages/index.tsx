import HeaderBar from "@components/page/HeaderBar";
import FooterBar from "@components/page/FooterBar";
import PageHeader from "@components/page/PageHeader";
import EventSearch from "@components/search/EventSearch";

export default function Home() {
  return (
    <>
      <PageHeader
        title="Tix Trend"
        description="Track ticket prices over time and never miss a deal again."
        url={process.env.SITE_URL + "/"}
      />
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <HeaderBar />
        <EventSearch />
        <FooterBar />
      </div>
    </>
  );
}
