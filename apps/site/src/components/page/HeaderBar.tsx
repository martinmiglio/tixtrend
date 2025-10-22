import { Link } from "@tanstack/react-router";
import { Separator } from "@tixtrend/ui/components/separator";

const HeaderBar = () => {
  return (
    <div className="mb-3">
      <div className="pb-2 sm:flex sm:items-center sm:justify-between">
        <Link
          to="/"
          className="mb-4 flex items-center sm:mb-0"
          search={{ keyword: "", page: 1 }}
        >
          <img
            src="/logo-gray.svg"
            alt="TixTrend Logo"
            width={60}
            height={60}
            className="mr-2"
          />
          <h1 className="text-4xl">TixTrend</h1>
        </Link>
        <ul className="mb-6 mr-4 flex flex-wrap items-center space-x-8 text-sm font-medium text-muted-foreground sm:mb-0">
          <li>
            <Link
              to="/"
              className="hover:underline hover:text-foreground"
              search={{ keyword: "", page: 1 }}
            >
              Search
            </Link>
          </li>
          <li>
            <Link
              to="/saved-events"
              className="hover:underline hover:text-foreground"
            >
              Saved Events
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:underline hover:text-foreground">
              About
            </Link>
          </li>
        </ul>
      </div>
      <Separator />
    </div>
  );
};

export default HeaderBar;
