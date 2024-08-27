import winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf, json } = winston.format;

const errorFilter = winston.format((info, opts) => {
    return info.level === 'error' ? info : false;
});
  
const infoFilter = winston.format((info, opts) => {
    return info.level === 'info' ? info : false;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: 'app-error.log',
        level: 'error',
        format: combine(errorFilter(), timestamp(), json()),
      }),
    new winston.transports.File({
        filename: 'app-info.log',
        level: 'info',
        format: combine(infoFilter(), timestamp(), json()),
    })
  ]
});

export default logger;
