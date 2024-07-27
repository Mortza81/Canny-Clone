const winston = require('winston');
require('winston-daily-rotate-file');

const transportInfo = new winston.transports.DailyRotateFile({
  filename: './logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  maxSize: '50m',
  maxFiles: '14d',
  level:'info'
});
const transportError = new winston.transports.DailyRotateFile({
    filename: './logs/errors-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '50m',
    maxFiles: '21d',
    level:'error'
  });
const transports=[]
if (process.env.NODE_ENV === 'development') {
  const devTransport=new winston.transports.Console({
    format: winston.format.simple(),
  })
  transports.push(devTransport)
}else{
  transports.push(transportError,transportInfo)
}
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports:transports,
});

module.exports=logger