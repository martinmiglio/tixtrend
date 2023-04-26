/* This lambda function polls the Ticketmaster API for the price of each event in the watch list. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const watchListTableName = "tixtrend-watched-events";
const priceListTableName = "tixtrend-event-prices";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

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

      const url = `${API_URL}?id=${event_id}&apikey=${process.env.TICKETMASTER_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();

      const { priceRanges } = json._embedded.events[0];
      const { min, max } = priceRanges[0];

      const { event_date } = json._embedded.events[0].dates.start.localDate;
      const timestamp = new Date().getTime();
      const ttl = new Date(event_date).getTime() + 86400000;

      await dynamo
        .put({
          TableName: priceListTableName,
          Item: {
            event_id,
            timestamp,
            min,
            max,
            ttl,
          },
        })
        .promise();
    });

    await Promise.all(promises);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully polled all events.",
      }),
    };
  } catch (error) {
    return {
      statusCode: 512,
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }
};
