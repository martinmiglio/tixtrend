import Image from "next/image";
import Link from "next/link";

const HeaderBar = ({ noTagline }: { noTagline?: boolean }) => {
  return (
    <>
      <div className="mb-3 border-b border-gray-700">
        <div className="pb-2 sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="mb-4 flex items-center sm:mb-0">
            <Image
              src="/logo-gray.svg"
              alt="TixTrend Logo"
              width={60}
              height={60}
              className="mr-2"
              priority
            />
            <h1 className="text-4xl">TixTrend</h1>
          </Link>
          <ul className="mb-6 mr-4 flex flex-wrap items-center space-x-8 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mb-0">
            <li>
              <Link href="/" className="hover:underline">
                Search
              </Link>
            </li>
            <li>
              <Link href="/saved-events" className="hover:underline">
                Saved Events
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {!noTagline && (
        <div className="flex w-full flex-col items-center justify-center pb-5">
          <h2 className="mt-2 font-tagline text-3xl font-extrabold italic leading-10  tracking-tighter sm:text-4xl md:tracking-normal ">
            Stay Ahead of the Game
          </h2>
          <h3 className="my-2 text-xl leading-6 tracking-tight">
            Track ticket prices over time and never miss a deal again.
          </h3>
        </div>
      )}
    </>
  );
};

export default HeaderBar;
