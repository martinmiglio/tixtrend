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
    const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;

    if (!TICKETMASTER_API_KEY) {
      throw new Error("TICKETMASTER_API_KEY is not defined");
    }

    const stage = $app.stage;
    const isProduction = stage === "production";

    // Use SOFT validation in production to handle incomplete API responses gracefully
    // Use STRICT in other environments to catch schema issues during development
    const TICKETMASTER_VALIDATION_MODE =
      process.env.TICKETMASTER_VALIDATION_MODE ||
      (isProduction ? "SOFT" : "STRICT");

    const tables: Record<string, sst.aws.Dynamo> = isProduction
      ? {
          eventPricesTable: sst.aws.Dynamo.get(
            "EventPricesTable",
            "tixtrend-event-prices",
          ),
          watchedEventsTable: sst.aws.Dynamo.get(
            "WatchedEventsTable",
            "tixtrend-watched-events",
          ),
          eventPollFailuresTable: sst.aws.Dynamo.get(
            "EventPollFailuresTable",
            "tixtrend-event-poll-failures",
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
          eventPollFailuresTable: new sst.aws.Dynamo(`EventPollFailuresTable`, {
            deletionProtection: false,
            fields: {
              event_id: "string",
              timestamp: "number",
            },
            primaryIndex: { hashKey: "event_id", rangeKey: "timestamp" },
            ttl: "ttl",
          }),
        };

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

    new sst.aws.TanStackStart("Site", {
      path: "apps/site",
      router: {
        instance: router,
        domain: baseDomain,
      },
      link: [...Object.values(tables)],

      environment: {
        TICKETMASTER_API_KEY,
        TICKETMASTER_VALIDATION_MODE,
      },
    });

    // Create standalone consumer Lambda for direct invocation
    const priceConsumer = new sst.aws.Function("PriceConsumer", {
      handler: "apps/workers/src/poll-prices-consumer.handler",
      link: [...Object.values(tables)],
      environment: {
        TICKETMASTER_API_KEY,
        TICKETMASTER_VALIDATION_MODE,
      },
      timeout: "15 minutes",
    });

    // Only enable cron in develop and production stages
    if (stage === "develop" || stage === "production") {
      new sst.aws.Cron("PricePollerCron", {
        schedule: "cron(0 10 * * ? *)", // Daily at 10am UTC
        job: {
          handler: "apps/workers/src/cron-trigger.handler",
          link: [...Object.values(tables), priceConsumer],
          environment: {
            TICKETMASTER_API_KEY,
            TICKETMASTER_VALIDATION_MODE,
          },
          timeout: "5 minutes",
        },
      });
    }
  },
  console: {
    autodeploy: {
      target(event) {
        if (event.type === "branch" && event.action === "pushed") {
          if (event.branch === "develop") {
            return { stage: "develop" };
          }

          if (event.branch === "master") {
            return { stage: "production" };
          }
        }
      },
    },
  },
});
