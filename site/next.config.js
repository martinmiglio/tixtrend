const { withAxiom } = require("next-axiom");
/** @type {import('next').NextConfig} */

module.exports = withAxiom({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ticketm.net" },
      { protocol: "https", hostname: "**.ticketweb.com" },
    ],
  },
});
