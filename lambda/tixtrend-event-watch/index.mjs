/* This lambda function adds an event to the watch list. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "tixtrend-watched-events";

const API_URL = "https://app.ticketmaster.com/discovery/v2/events";

export const handler = async (event) => {
  try {
    const { httpMethod } = event;
    if (!httpMethod) {
      return await handleGet(event);
    }
    switch (httpMethod) {
      case "GET":
        return await handleGet(event);
      case "OPTIONS":
        return await handleOptions();
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
  if (!queryStringParameters) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Missing query string parameters.",
      }),
    };
  }

  const { event_id, list } = queryStringParameters;
  if (event_id) {
    return checkEventWatch(event_id);
  }
  if (list) {
    return getWatchList(list);
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Unknown query string parameters.",
    }),
  };
};

const checkEventWatch = async (event_id) => {
  const { Item } = await dynamo
    .get({
      TableName: tableName,
      Key: { event_id },
    })
    .promise();

  if (Item) {
    const params = {
      TableName: tableName,
      Key: { event_id },
      UpdateExpression: "set watch_count = watch_count + :val",
      ExpressionAttributeValues: {
        ":val": 1,
      },
    };
    await dynamo.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Event is already being watched.",
        watched: true,
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
  const ttl =
    Math.floor(Date.parse(data.dates.start.dateTime) / 1000) + 60 * 60 * 24;

  const params = {
    TableName: tableName,
    Item: {
      event_id,
      watch_count: 1,
      timestamp,
      ttl,
    },
  };
  await dynamo.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Event added successfully.",
      watched: false,
      event: data,
    }),
  };
};

const getWatchList = async (count) => {
  const params = {
    TableName: tableName,
  };

  const { Items } = await dynamo.scan(params).promise();

  if (count > 0) {
    Items.sort((a, b) => b.watch_count - a.watch_count);
    Items.splice(count);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Watch list retrieved successfully.",
      count: Items.length,
      events: Items,
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
