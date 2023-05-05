const FooterBar = () => {
  return (
    <span className="block text-sm text-gray-500 text-center w-full pt-2">
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
