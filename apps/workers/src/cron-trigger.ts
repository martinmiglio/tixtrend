import type { EventBridgeHandler } from 'aws-lambda';
import { queueEventsForPolling } from '@tixtrend/core';

/**
 * EventBridge cron handler (runs daily at 10am UTC)
 * Queues watched events and popular events to SQS for price polling
 */
export const handler: EventBridgeHandler<'Scheduled Event', void, void> = async (event) => {
  console.info('Cron triggered:', event.time);

  try {
    const result = await queueEventsForPolling();

    console.info('Successfully queued events:', {
      watchList: result.watchList,
      popular: result.popular,
      saleSoon: result.saleSoon,
      total: result.total,
    });
  } catch (error) {
    console.error('Error queueing events:', error);
    throw error;
  }
};
