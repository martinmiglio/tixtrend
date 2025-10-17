// poll-prices-consumer.mjs
// This function is triggered by the SQS price poll queue
// It receives event IDs from the queue and calls the API route to poll prices

export const handler = async (event) => {
  try {
    console.info(`SQS EVENT\n${JSON.stringify(event, null, 2)}`);

    const { Records } = event;
    if (!Records || Records.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "No events to process.",
        }),
      };
    }

    // Process all records in the batch
    const results = await Promise.allSettled(
      Records.map(async (record) => {
        const event_id = record.body;
        console.info(`Processing event: ${event_id}`);

        const response = await fetch(
          `https://${process.env.SITE_URL}/api/poll-event`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.INTERNAL_API_KEY,
            },
            body: JSON.stringify({ event_id }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to poll event ${event_id}: ${response.status} - ${errorText}`,
          );
        }

        const result = await response.json();
        console.info(`Successfully polled event ${event_id}:`, result);
        return result;
      }),
    );

    // Log any failures
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`Failed to process ${failures.length} events:`, failures);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${Records.length} events.`,
        successful: results.filter((r) => r.status === "fulfilled").length,
        failed: failures.length,
      }),
    };
  } catch (error) {
    console.error("Error processing SQS messages:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "Unknown error",
      }),
    };
  }
};
