export const pageview = (url) => {
  window.gtag("config", process.env.GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

export const event = ({ action, params }) => {
  window.gtag("event", action, params);
};

export const searchEvent = (search_term) => {
  window.gtag("event", "search", {
    search_term,
  });
};
