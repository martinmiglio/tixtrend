/* This lambda function polls the Ticketmaster API for the price of each event in the watch list. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const watchListTableName = "tixtrend-watched-events";
const priceListTableName = "tixtrend-event-prices";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

export const handler = async (event) => {
  try {
    const { Items } = await dynamo
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

    const promises = Items.map(async (item) => {
      const { event_id } = item;

      const event_data = await getEventPrice(event_id);

      if (!event_data) {
        return;
      }

      await dynamo
        .put({
          TableName: priceListTableName,
          Item: event_data,
        })
        .promise();

      return event_data;
    });

    let events_data = await Promise.all(promises);

    // remove any null values
    events_data = events_data.filter((event) => event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully polled all events.",
        events_data,
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
  const event_start_date = new Date(data.dates.start.dateTime);
  const ttl = Math.floor(event_start_date.getTime() / 1000) + 60 * 60 * 24;

  return {
    event_id,
    timestamp,
    currency,
    min,
    max,
    ttl,
  };
};
