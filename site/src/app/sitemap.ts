import { baseURL } from "@/consts";
import { getAllEvents } from "@/lib/aws/events";
import { MetadataRoute } from "next";

export const revalidate = 60 * 60; // 1 hr

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticMap: MetadataRoute.Sitemap = [
    {
      url: baseURL.toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: baseURL.toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const events = await getAllEvents();

  const maxWatchCount = events.reduce((acc, event) => {
    if (!event.watch_count) {
      return acc;
    }
    return Math.max(acc, event.watch_count);
  }, 0);

  const postsMap: MetadataRoute.Sitemap = events
    .map((event) => {
      if (!event.event_id) {
        return;
      }
      const postUrl = baseURL;
      postUrl.pathname = `/event/${event.event_id}`;
      return {
        url: postUrl.toString(),
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: ((event.watch_count ?? 0) / maxWatchCount) * 0.2 + 0.8,
      };
    })
    .filter((sitemap) => sitemap !== undefined) as MetadataRoute.Sitemap;

  return [...staticMap, ...postsMap];
}
