import Script from "next/script";

export function GTagScript({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `,
        }}
      />
    </>
  );
}

export interface Event {
  name: string;
  category?: string;
  label?: string;
  value?: string | number;
}

export function GEvent({
  gEvent,
  trigger,
}: {
  gEvent: Event;
  trigger: boolean;
}) {
  if (!trigger) {
    return <></>;
  }
  return (
    <Script
      id={`${gEvent.name}-trigger`}
      dangerouslySetInnerHTML={{
        __html: `
      gtag('event', '${gEvent.name}', {
        'event_category': '${gEvent.category ?? gEvent.name}',
        'event_label': '${gEvent.label ?? gEvent.name}',
        'value': '${gEvent.value ?? 1}'
      });
    `,
      }}
    />
  );
}
