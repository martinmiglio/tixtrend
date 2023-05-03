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
      <meta
        property="og:image"
        content={
          parsedURL.protocol + "//" + parsedURL.host + "/wide-1200x630.png"
        }
      />
      <meta name="twitter:site" content={title} />
      <meta name="twitter:creator" content="@martinmiglio" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <link rel="canonical" href={parsedURL.protocol + "//" + parsedURL.host} />
      <link rel="icon" type="image/svg+xml" href="favicon.svg" />
      <link rel="icon" type="image/png" href="favicon.png" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4f46e5" />
      <meta name="msapplication-TileColor" content="#f2f2f2" />
      <meta name="theme-color" content="#f2f2f2" />
    </Head>
  );
};

export default PageHeader;
