import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 6000, // 10 requests per minute
});

export const rateLimit = <T>(fn: (...args: any[]) => Promise<T>): (...args: any[]) => Promise<T> => {
  return limiter.wrap(fn);
};