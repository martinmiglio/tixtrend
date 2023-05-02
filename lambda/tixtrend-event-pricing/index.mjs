/* This lambda function reads the price history of an event. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "tixtrend-event-prices";

export const handler = async (event) => {
  try {
    const { httpMethod } = event;
    if (!httpMethod) {
      return handleGet(event);
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
  const { event_id } = queryStringParameters;

  if (!event_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Event ID is required.",
      }),
    };
  }

  const { Items } = await dynamo
    .query({
      TableName: tableName,
      KeyConditionExpression: "event_id = :event_id",
      ExpressionAttributeValues: {
        ":event_id": event_id,
      },
    })
    .promise();

  if (Items.length === 0) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Event not found.",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(Items),
  };
};

const handleOptions = async () => {
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
