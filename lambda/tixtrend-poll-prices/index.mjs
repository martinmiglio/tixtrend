// tixtrend-poll-prices\index.mjs
// this function is triggered by the price poll queue
// it will read an event id from the queue and poll the price, then save it to the database

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const eventPricesTableName = "tixtrend-event-prices";
const pricePollQueueURL =
  "https://sqs.us-east-1.amazonaws.com/501123347638/tixtrend-price-poll-queue.fifo";
const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

export const handler = async (event) => {
  try {
    console.info("EVENT\n" + JSON.stringify(event, null, 2));
    // read an event id from the sqs queue
    const { Records } = event;
    if (Records.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "No events to poll.",
        }),
      };
    }
    const { body: event_id, receiptHandle } = Records[0];

    // get the price of the event
    const eventPrice = await getEventPrice(event_id);

    if (!eventPrice) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: `Event ${event_id} not found.`,
        }),
      };
    }

    // save the price to the database
    await dynamo
      .put({
        TableName: eventPricesTableName,
        Item: eventPrice,
      })
      .promise();

    // delete the message from the queue
    await sqs
      .deleteMessage({
        QueueUrl: pricePollQueueURL,
        receiptHandle,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully polled event ${event_id}.`,
        eventPrice,
      }),
    };
  } catch (error) {
    return {
      statusCode: 512,
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }
};

const getEventPrice = async (event_id) => {
  const url = `${API_URL}/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    // if too many requests, recuse with a delay
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return getEventPrice(event_id);
    }
    return;
  }

  const data = await response.json();

  const { priceRanges } = data;
  if (!priceRanges) {
    // this event doesn't have a price range yet, skip for now
    return;
  }
  const { min, max, currency } = priceRanges[0];

  const timestamp = Date.now();
  const ttl =
    Math.floor(Date.parse(data.dates.start.dateTime) / 1000) + 60 * 60 * 24;

  return {
    event_id,
    timestamp,
    currency,
    min,
    max,
    ttl,
  };
};
