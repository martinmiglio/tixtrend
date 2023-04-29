import React from "react";
import Link from "next/link";

const HeaderBar = ({ noTagline }: { noTagline?: boolean }) => {
  return (
    <>
      <div className="border-b border-gray-700 mb-3">
        <div className="sm:flex sm:items-center sm:justify-between pb-2">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <h1 className="text-4xl">TixTrend</h1>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400 space-x-8 mr-4">
            <li>
              <Link href="/">Search</Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline ">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {!noTagline && (
        <div className="w-full flex flex-col justify-center items-center pb-5">
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
            Stay Ahead of the Game
          </h2>
          <h3 className="text-xl my-2 leading-6 tracking-tight">
            Track ticket prices over time and never miss a deal again.
          </h3>
        </div>
      )}
    </>
  );
};

export default HeaderBar;
