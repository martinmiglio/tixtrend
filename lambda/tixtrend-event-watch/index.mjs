/* This lambda function adds an event to the watch list. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "tixtrend-watched-events";

export const handler = async (event) => {
  try {
    const { httpMethod } = event;
    switch (httpMethod) {
      case "PUT":
        return handlePut(event, context);
      case "OPTIONS":
        return handleOptions(event, context);
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

const handlePut = async (event, context) => {
  const { body } = event;

  const { event_id, event_name, event_date } = JSON.parse(body);

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

  const timestamp = new Date().getTime();
  const ttl = new Date(event_date).getTime() + 86400000;

  const params = {
    TableName: tableName,
    Item: {
      event_id,
      event_name,
      event_date,
      timestamp,
      ttl,
    },
  };
  await dynamo.put(params).promise();
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Event added successfully.",
      event: params.Item,
    }),
  };
};

const handleOptions = async (event, context) => {
  // Return the allowed methods for CORS
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PUT,OPTIONS",
    },
    body: JSON.stringify({ success: true }),
  };
};
