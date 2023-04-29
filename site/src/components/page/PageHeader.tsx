import React from "react";
import Head from "next/head";
import Script from "next/script";

type PageHeaderProps = {
  title: string;
  description: string;
  url: string;
};

const PageHeader = ({ title, description, url }: PageHeaderProps) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} key="ogtitle" />
      <meta property="og:description" content={description} key="ogdesc" />
      <meta property="og:url" content={url} key="ogurl" />
      <meta property="og:type" content="website" />
      <meta name="twitter:site" content={title} />
      <meta name="twitter:creator" content="@martinmiglio" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-G6RF669QT8"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-G6RF669QT8');
        `,
        }}
      />
    </Head>
  );
};

export default PageHeader;
