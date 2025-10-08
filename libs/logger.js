
// Logger template
function format(level, message, meta) {
  const time = new Date().toISOString();
  const extra = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `[${time}] [${level.toUpperCase()}] ${message}${extra}`;
}

const logger = {
  info: (msg, meta = {}) => console.log(format('info', msg, meta)),
  warn: (msg, meta = {}) => console.warn(format('warn', msg, meta)),
  error: (msg, meta = {}) => console.error(format('error', msg, meta)),
  debug: (msg, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(format('debug', msg, meta));
    }
  },
};

module.exports = { logger };
