import { faChartLine, faDatabase } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export const metadata = {
  title: "About",
};

export default function About() {
  return (
    <>
      <div className="lg:text-center">
        <h2 className="text-base font-semibold uppercase tracking-wide text-indigo-600">
          About TixTrend
        </h2>
      </div>
      <div className="mb-5 mt-10">
        <dl className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:space-y-0">
          <div className="relative">
            <dt>
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                <FontAwesomeIcon className="h-5 w-5" icon={faChartLine} />
              </div>
              <p className="ml-16 text-lg font-medium leading-6">
                Track Ticket Prices Over Time
              </p>
            </dt>
            <dd className="ml-16 mt-2 text-base text-gray-400">
              With TixTrend, you can easily track ticket prices for your
              favorite events over time. Our powerful tool allows you to see
              historical trends and make informed decisions about when to buy
              your tickets. <br />
              <Link href="/" className="text-indigo-600 hover:text-indigo-500">
                Search for an event now &rarr;
              </Link>
            </dd>
          </div>
          <div className="relative">
            <dt>
              <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white">
                <FontAwesomeIcon className="h-5 w-5" icon={faDatabase} />
              </div>
              <p className="ml-16 text-lg font-medium leading-6">
                Data from Ticketmaster&apos;s Discover API
              </p>
            </dt>
            <dd className="ml-16 mt-2 text-base text-gray-400">
              TixTrend collects its data from Ticketmaster&apos;s Discover API,
              the premier source for event and ticket information. With this
              reliable data, you can be sure that the information you&apos;re
              getting is accurate and up-to-date. <br />
              <a
                href="https://developer.ticketmaster.com/explore/"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Learn more about Ticketmaster&apos;s Discover API &rarr;
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
}
