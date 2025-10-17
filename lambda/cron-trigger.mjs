// Simple Lambda function to trigger the queue-watched-events endpoint
// This is triggered by EventBridge cron schedule

export const handler = async (event) => {
  try {
    const siteUrl = process.env.SITE_URL;
    const apiUrl = `https://${siteUrl}/api/queue-watched-events`;

    console.info(`Triggering queue-watched-events endpoint: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.INTERNAL_API_KEY,
      },
    });

    const data = await response.json();

    console.info("Response:", data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully triggered queue-watched-events",
        result: data,
      }),
    };
  } catch (error) {
    console.error("Error triggering queue-watched-events:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to trigger queue-watched-events",
        error: error.message,
      }),
    };
  }
};
