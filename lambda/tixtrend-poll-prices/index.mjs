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

      const url = `${API_URL}/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const { priceRanges } = data;
      const { min, max, currency } = priceRanges[0];

      const timestamp = Date.now();
      const event_start_date = new Date(data.dates.start.dateTime);
      const ttl = Math.floor(event_start_date.getTime() / 1000) + 60 * 60 * 24;

      const event_data = {
        event_id,
        timestamp,
        currency,
        min,
        max,
        ttl,
      };

      await dynamo
        .put({
          TableName: priceListTableName,
          Item: event_data,
        })
        .promise();

      return event_data;
    });

    const events_data = await Promise.all(promises);

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
