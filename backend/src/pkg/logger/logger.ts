const logger = {
  info(message: string, metadata?: object) {
    console.log("info", message, ...(metadata ? [metadata] : []));
  },

  warn(message: string, metadata?: object) {
    console.log("warn", message, ...(metadata ? [metadata] : []));
  },

  error(message: string, metadata?: object) {
    console.log("error", message, ...(metadata ? [metadata] : []));
  },

  debug(message: string, metadata?: object) {
    console.log("debug", message, ...(metadata ? [metadata] : []));
  },
};

export default logger;
