/* This lambda function reads the price history of an event. */

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();

const tableName = "tixtrend-event-prices";

export const handler = async (event) => {
  try {
    const { httpMethod } = event;
    switch (httpMethod) {
      case "GET":
        return handleGet(event, context);
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

const handleGet = async (event, context) => {
  const { pathParameters } = event;
  const { event_id } = pathParameters;

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
