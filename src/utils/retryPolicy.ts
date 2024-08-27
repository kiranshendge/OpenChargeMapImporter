import retry from 'retry';
import { ChargingStation } from '../models/ChargingStation';
import logger from './logger';

export const retryOperation = (operation: () => Promise<ChargingStation[]>, retries = 5, factor = 2) => {
  const operationRetry = retry.operation({
    retries,
    factor,
    minTimeout: 1000,
    maxTimeout: 60000,
  });

  return new Promise((resolve, reject) => {
    operationRetry.attempt(async (currentAttempt) => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error: any) {
        if (operationRetry.retry(error)) {
          logger.info(`Retrying operation, attempt ${currentAttempt}`);
          return;
        }
        logger.error(`error during retry: ${operationRetry.mainError()}`)
        reject(operationRetry.mainError());
      }
    });
  });
};
