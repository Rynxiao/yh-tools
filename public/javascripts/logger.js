const log4js = require('log4js');
const CONFIG = require('../../build/config');

log4js.configure({
  appenders: {
    file: { type: 'file', filename: `${CONFIG.LOGGER_CATEGORY}.log` },
    out: { type: 'stdout' },
  },
  categories: { default: { appenders: ['out', 'file'], level: 'info' } },
});
const logger = log4js.getLogger(CONFIG.LOGGER_CATEGORY);

module.exports = logger;
