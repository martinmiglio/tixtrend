// tixtrend-queue-watched-events\index.mjs
// this function will be triggered by a cron job every day at 10am
// it will read all the events from the watch list table and send them to the price poll queue

import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

const watchListTableName = "tixtrend-watched-events";
const pricePollQueueURL =
  "https://sqs.us-east-1.amazonaws.com/501123347638/tixtrend-price-poll-queue.fifo";

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

      const params = {
        MessageGroupId: "1",
        MessageBody: event_id,
        QueueUrl: pricePollQueueURL,
      };

      return await sqs.sendMessage(params).promise();
    });

    const messageData = await Promise.all(promises);

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
