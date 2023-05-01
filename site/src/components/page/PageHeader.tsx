import React from "react";
import Head from "next/head";

type PageHeaderProps = {
  title: string;
  description: string;
  url: string;
};

const PageHeader = ({ title, description, url }: PageHeaderProps) => {
  const parsedURL = new URL(url);
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} key="ogtitle" />
      <meta property="og:description" content={description} key="ogdesc" />
      <meta property="og:url" content={parsedURL.href} key="ogurl" />
      <meta property="og:type" content="website" />
      <meta name="twitter:site" content={title} />
      <meta name="twitter:creator" content="@martinmiglio" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={parsedURL.protocol + "//" + parsedURL.host} />
      <link
        href="https://fonts.cdnfonts.com/css/averta-blackitalic"
        rel="stylesheet"
      />
      <link rel="icon" type="image/svg+xml" href="favicon.svg" />
      <link rel="icon" type="image/png" href="favicon.png" />
    </Head>
  );
};

export default PageHeader;
