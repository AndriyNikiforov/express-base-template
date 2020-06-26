const winston = require('winston');
const appRoot = require('app-root-path');
const { resolve } = require('path');
const { existsSync, mkdirSync } = require('fs');

const { LOG_FILE_MAX_SIZE } = process.env;
const logDirectory = resolve(`${appRoot}`, 'logs');

if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory);
}

const options = {
  console: {
    level: 'info',
    handleException: true,
    format: winston.format.simple(),
    colorize: true,
  },
  infoFile: {
    level: 'info',
    filename: resolve(logDirectory, 'info.log'),
    handleException: true,
    json: true,
    maxsize: LOG_FILE_MAX_SIZE,
    maxFiles: 5,
  },
  errorFile: {
    level: 'error',
    filename: resolve(logDirectory, 'error.log'),
    handleException: true,
    json: true,
    maxsize: LOG_FILE_MAX_SIZE,
    maxFiles: 5,
  },
};

const listenerOptions = {
  transports: [
    new winston.transports.File(options.infoFile),
    new winston.transports.File(options.errorFile),
    new winston.transports.Console(options.console),
  ],
};

const logger = winston.createLogger(listenerOptions);
logger.stream = {
  write: (message) => {
    logger.info(message);
  },
};
logger.combinedFormat = (err, req) => `
  ${req.ip} -- [${new Date().toISOString()}] \n
  [method] ${req.method} -- [url] ${req.originalUrl} \n
  [status] ${err.status || 500} -- ${req.headers['user-agent']}
`;

module.exports = logger;
