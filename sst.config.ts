/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "tixtrend",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          profile: "tixtrend",
          region: "us-east-1",
        },
      },
    };
  },
  async run() {
    const { randomBytes } = await import("node:crypto");

    const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

    if (!TICKETMASTER_API_KEY) {
      throw new Error("TICKETMASTER_API_KEY is not defined");
    }

    const stage = $app.stage;
    const isProduction = stage === "production";

    const INTERNAL_API_KEY = randomBytes(32).toString("hex");

    const tables: Record<string, sst.aws.Dynamo> = isProduction
      ? {
          eventPricesTable: sst.aws.Dynamo.get(
            "EventPricesTable",
            "tixtrend-event-prices"
          ),
          watchedEventsTable: sst.aws.Dynamo.get(
            "WatchedEventsTable",
            "tixtrend-watched-events"
          ),
        }
      : {
          eventPricesTable: new sst.aws.Dynamo(`EventPricesTable`, {
            deletionProtection: false,
            fields: {
              event_id: "string",
              timestamp: "number",
            },
            primaryIndex: { hashKey: "event_id", rangeKey: "timestamp" },
            ttl: "ttl",
          }),
          watchedEventsTable: new sst.aws.Dynamo(`WatchedEventsTable`, {
            deletionProtection: false,
            fields: {
              event_id: "string",
            },
            primaryIndex: { hashKey: "event_id" },
            ttl: "ttl",
          }),
        };

    const pricePollQueue: sst.aws.Queue = isProduction
      ? sst.aws.Queue.get(
          "PricePollQueue",
          "https://sqs.us-east-1.amazonaws.com/501123347638/tixtrend-price-poll-queue.fifo"
        )
      : new sst.aws.Queue("PricePollQueue", {
          fifo: true,
        });

    const baseDomain = isProduction
      ? "tixtrend.martinmiglio.dev"
      : `${stage}.tixtrend.martinmiglio.dev`;

    const dns = sst.aws.dns({
      zone: "Z00930942RK5CDM0O5SAH", // martinmiglio.dev
    });

    const router = new sst.aws.Router("ApiRouter", {
      domain: {
        name: baseDomain,
        aliases: [`*.${baseDomain}`],
        dns,
      },
    });

    const site = new sst.aws.TanStackStart("Site", {
      path: "apps/site",
      router: {
        instance: router,
        domain: baseDomain,
      },
      link: [...Object.values(tables), pricePollQueue],

      environment: {
        TICKETMASTER_API_KEY,
        INTERNAL_API_KEY,
      },
    });

    new sst.aws.Cron("PricePollerCron", {
      schedule: "cron(0 10 * * ? *)", // Daily at 10am UTC
      job: {
        handler: "apps/workers/src/cron-trigger.handler",
        link: [...Object.values(tables), pricePollQueue],
        environment: {
          TICKETMASTER_API_KEY,
        },
        nodejs: {
          install: ["@tixtrend/core"],
        },
      },
    });

    pricePollQueue.subscribe(
      {
        handler: "apps/workers/src/poll-prices-consumer.handler",
        link: [...Object.values(tables)],
        environment: {
          TICKETMASTER_API_KEY,
        },
        nodejs: {
          install: ["@tixtrend/core"],
        },
      },
      {
        batch: {
          size: 10,
        },
      }
    );
  },
});
