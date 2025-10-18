import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, ChartSpline } from "lucide-react";
import { Badge } from "@tixtrend/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@tixtrend/ui/components/card";
import { Button } from "@tixtrend/ui/components/button";

export const Route = createFileRoute("/about/")({
  head: () => ({
    meta: [
      { title: "About" },
      {
        name: "description",
        content:
          "Learn about TixTrend's ticket price tracking powered by Ticketmaster's Discover API",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="lg:text-center mb-10">
        <Badge variant="default" className="text-base px-3 py-1">
          About TixTrend
        </Badge>
      </div>
      <div className="mb-5">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground mb-4">
                <ChartSpline className="h-5 w-5" />
              </div>
              <CardTitle>Track Ticket Prices Over Time</CardTitle>
              <CardDescription>
                With TixTrend, you can easily track ticket prices for your
                favorite events over time. Our powerful tool allows you to see
                historical trends and make informed decisions about when to buy
                your tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="px-0" asChild>
                <Link to="/">Search for an event now &rarr;</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground mb-4">
                <Database className="h-5 w-5" />
              </div>
              <CardTitle>Data from Ticketmaster&apos;s Discover API</CardTitle>
              <CardDescription>
                TixTrend collects its data from Ticketmaster&apos;s Discover
                API, the premier source for event and ticket information. With
                this reliable data, you can be sure that the information
                you&apos;re getting is accurate and up-to-date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="link" className="px-0" asChild>
                <a href="https://developer.ticketmaster.com/explore/">
                  Learn more about Ticketmaster&apos;s Discover API &rarr;
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
