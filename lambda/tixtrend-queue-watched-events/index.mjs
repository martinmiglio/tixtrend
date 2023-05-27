// tixtrend-queue-watched-events\index.mjs
// this function will be triggered by a cron job every day at 10am
// it will read all the events from the watch list table and send them to the price poll queue

import AWS from "aws-sdk";

const MAX_QUEUE_LENGTH = 4000;

const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const watchListTableName = "tixtrend-watched-events";
const pricePollQueueURL =
  "https://sqs.us-east-1.amazonaws.com/501123347638/tixtrend-price-poll-queue.fifo";

export const handler = async (event) => {
  try {
    const watchListMessageData = await queueWatchList();
    const numberOfFillerEvents = MAX_QUEUE_LENGTH - watchListMessageData.length;
    const popularEventsMessageData = await queuePopularEvents(
      numberOfFillerEvents
    );

    const messageData = [...watchListMessageData, ...popularEventsMessageData];

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully polled events.",
        messageData,
      }),
    };
  } catch (error) {
    return {
      statusCode: 512,
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }
};

const queueWatchList = async () => {
  let { Items } = await dynamo
    .scan({
      TableName: watchListTableName,
      ProjectionExpression: "event_id",
    })
    .promise();

  if (Items.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "No events to poll.",
      }),
    };
  }

  // console info count
  console.info("watch list count", Items.length);

  // if more than MAX_QUEUE_LENGTH events in watch list, only queue MAX_QUEUE_LENGTH and console warn
  if (Items.length > MAX_QUEUE_LENGTH) {
    Items = Items.slice(0, MAX_QUEUE_LENGTH);
    console.warn(
      `Watch list has ${Items.length} events. Only queuing ${MAX_QUEUE_LENGTH} events.`
    );
  }

  const eventIds = Items.map((item) => item.event_id);

  console.info("watch list eventIds", eventIds);

  const promises = eventIds.map(async (event_id) => {
    const params = {
      MessageGroupId: "1",
      MessageBody: event_id,
      QueueUrl: pricePollQueueURL,
    };

    return await sqs.sendMessage(params).promise();
  });

  return Promise.all(promises);
};

const queuePopularEvents = async (numberOfEvents) => {
  const EVENTS_PER_PAGE = 20;
  const TIME_BETWEEN_REQUESTS = 2000; // in milliseconds

  // get the most popular events from ticketmaster
  const eventPromises = Array(Math.ceil(numberOfEvents / EVENTS_PER_PAGE))
    .fill()
    .map(async (_, index) => {
      const page = index + 1;
      const size = EVENTS_PER_PAGE;
      const delay = page * TIME_BETWEEN_REQUESTS;

      // sleep for a bit to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, delay));

      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events?apikey=${process.env.TICKETMASTER_API_KEY}&size=${size}&page=${page}`
      );

      const { _embedded } = await response.json();

      return _embedded.events.map((event) => event.id);
    });

  const eventIdsByPage = await Promise.all(eventPromises);

  const eventIds = eventIdsByPage.flat().slice(0, numberOfEvents);

  console.info("popular eventIds", eventIds);

  const queuePromises = eventIds.map(async (event_id) => {
    const params = {
      MessageGroupId: "1",
      MessageBody: event_id,
      QueueUrl: pricePollQueueURL,
    };

    return await sqs.sendMessage(params).promise();
  });

  return Promise.all(queuePromises);
};
