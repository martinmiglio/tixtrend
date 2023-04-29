import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faDatabase } from "@fortawesome/free-solid-svg-icons";

import HeaderBar from "@components/HeaderBar";
import FooterBar from "@components/FooterBar";

export default function About() {
  return (
    <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
      <HeaderBar />
      <div className="max-w-7xl mx-auto">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            About TixTrend
          </h2>
        </div>
        <div className="mt-10 mb-5">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium">
                  Track Ticket Prices Over Time
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-400">
                With TixTrend, you can easily track ticket prices for your
                favorite events over time. Our powerful tool allows you to see
                historical trends and make informed decisions about when to buy
                your tickets.
              </dd>
            </div>
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FontAwesomeIcon icon={faDatabase} />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium">
                  Data from Ticketmaster's Discover API
                </p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-400">
                TixTrend collects its data from Ticketmaster's Discover API, the
                premier source for event and ticket information. With this
                reliable data, you can be sure that the information you're
                getting is accurate and up-to-date.{" "}
                <a
                  href="https://developer.ticketmaster.com/explore/"
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  Learn more about Ticketmaster's Discover API &rarr;
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <FooterBar />
    </div>
  );
}
