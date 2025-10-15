import EventSearch from "@/components/search/EventSearch";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [view, setView] = useState(0);

  const handleButtonClick = () => {
    setView(1);
  };

  const views = [
    <div
      className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0"
      key="buttonView"
    >
      <button
        type="button"
        onClick={handleButtonClick}
        className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center rounded-full text-background hover:text-primary bg-primary hover:bg-secondary focus:ring-4 focus:ring-primary group"
      >
        Search for an event
        <svg
          className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 10"
        >
          <path
            className="stroke-background group-hover:stroke-primary"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>
      </button>
      <Link
        to="/about"
        className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center rounded-full border border-primary hover:border-secondary hover:bg-secondary focus:ring-4 focus:ring-secondary"
      >
        Learn more
      </Link>
    </div>,
    <EventSearch key="searchView" />,
  ];

  return (
    <section className="max-w-full">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-tagline font-extrabold italic tracking-tight leading-10 md:text-5xl lg:text-6xl">
          Stay Ahead of the Game
        </h1>
        <p className="mb-8 text-lg font-normal text-secondary lg:text-xl sm:px-16 lg:px-48 tracking-tight">
          Track ticket prices over time and never miss a deal again.
        </p>
        <AnimatePresence>
          <motion.div
            className="flex justify-center"
            key={view}
            variants={{
              enter: {
                x: 1500,
                opacity: 0,
              },
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
              },
              exit: {
                zIndex: 0,
                x: -1500,
                opacity: 0,
                height: 0,
              },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 1 },
            }}
          >
            {views[view]}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
