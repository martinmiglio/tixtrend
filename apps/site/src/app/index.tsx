import EventSearch from "@/components/search/EventSearch";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const searchParamsSchema = z.object({
  keyword: z.string().optional().default(""),
  page: z.number().int().positive().optional().default(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

export const Route = createFileRoute("/")({
  validateSearch: (search) => searchParamsSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Tix Trend" },
      {
        name: "description",
        content: "Track ticket prices over time and never miss a deal again.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <section className="max-w-full">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
        <h1 className="mb-4 text-4xl font-tagline font-extrabold italic tracking-tight leading-10 md:text-5xl lg:text-6xl">
          Stay Ahead of the Game
        </h1>
        <p className="mb-8 text-lg font-normal text-secondary lg:text-xl sm:px-16 lg:px-48 tracking-tight">
          Track ticket prices over time and never miss a deal again.
        </p>
        <div className="flex justify-center">
          <EventSearch />
        </div>
      </div>
    </section>
  );
}
