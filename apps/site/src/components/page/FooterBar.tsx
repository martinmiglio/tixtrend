const FooterBar = () => {
  return (
    <span className="mt-auto block w-full pt-2 text-center text-sm text-gray-500">
      This site uses data from{" "}
      <a href="https://ticketmaster.com/" className="hover:underline">
        TicketMaster
      </a>
      . <br className="sm:hidden" />© 2023{" "}
      <a href="https://martinmiglio.dev/" className="hover:underline">
        Martin Miglio
      </a>
      . All Rights Reserved.
    </span>
  );
};

export default FooterBar;
