import Bottleneck from 'bottleneck';

export const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 6000, // 10 requests per minute
});
