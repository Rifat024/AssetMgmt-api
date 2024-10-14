const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = logLevels[process.env.LOG_LEVEL] || logLevels.debug;

function logMessage(level, message, ...additional) {
  if (logLevels[level] < currentLogLevel) {
    return;
  }

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'debug':
      console.debug(formattedMessage, ...additional);
      break;
    case 'info':
      console.info(formattedMessage, ...additional);
      break;
    case 'warn':
      console.warn(formattedMessage, ...additional);
      break;
    case 'error':
      console.error(formattedMessage, ...additional);
      break;
    default:
      console.log(formattedMessage, ...additional);
      break;
  }
}

const logger = {
  debug(message, ...additional) {
    logMessage('debug', message, ...additional);
  },
  info(message, ...additional) {
    logMessage('info', message, ...additional);
  },
  warn(message, ...additional) {
    logMessage('warn', message, ...additional);
  },
  error(message, ...additional) {
    logMessage('error', message, ...additional);
  },
};

export let log = logger;