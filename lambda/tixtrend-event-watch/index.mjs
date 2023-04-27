/* This lambda function adds an event to the watch list. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "tixtrend-watched-events";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

export const handler = async (event) => {
  try {
    const { httpMethod } = event;
    if (!httpMethod) {
      return handleGet(event);
    }
    switch (httpMethod) {
      case "GET":
        return handleGet(event);
      case "OPTIONS":
        return handleOptions();
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `Unsupported method ${httpMethod}`,
            event: event,
          }),
        };
    }
  } catch (error) {
    return {
      statusCode: 512,
      body: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    };
  }
};

const handleGet = async (event) => {
  const { queryStringParameters } = event;
  const { event_id } = queryStringParameters;

  if (!event_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Event ID is required.",
      }),
    };
  }

  const { Item } = await dynamo
    .get({
      TableName: tableName,
      Key: { event_id },
    })
    .promise();
  if (Item) {
    return {
      statusCode: 409,
      body: JSON.stringify({
        message: "Event is already being watched.",
        event: Item,
      }),
    };
  }

  const url = `${API_URL}/${event_id}?apikey=${process.env.TICKETMASTER_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Event not found.",
      }),
    };
  }

  const data = await response.json();

  const timestamp = Date.now();
  const event_start_date = new Date(data.dates.start.dateTime);
  const ttl = Math.floor(event_start_date.getTime() / 1000) + 60 * 60 * 24;

  const params = {
    TableName: tableName,
    Item: {
      event_id,
      timestamp,
      ttl,
    },
  };
  await dynamo.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Event added successfully.",
      event: data,
    }),
  };
};

const handleOptions = async () => {
  // Return the allowed methods for CORS
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
    },
    body: JSON.stringify({ success: true }),
  };
};
