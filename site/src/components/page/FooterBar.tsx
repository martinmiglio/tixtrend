import React from "react";

const FooterBar = () => {
  return (
    <span className="block text-sm text-gray-500 sm:text-center">
      © 2023{" "}
      <a href="https://martinmiglio.dev/" className="hover:underline">
        Martin Miglio
      </a>
      . All Rights Reserved. This site uses data from{" "}
      <a href="https://ticketmaster.com/" className="hover:underline">
        TicketMaster
      </a>
      .
    </span>
  );
};

export default FooterBar;
