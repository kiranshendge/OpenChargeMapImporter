import { createClient } from 'redis';
import logger from '../utils/logger';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => logger.error(`Redis Client Error ${err}`));

redisClient.connect().catch(console.error);

export default redisClient;
