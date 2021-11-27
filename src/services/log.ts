const environment = process.env.NODE_ENV || 'development';

/**
 * Setting value to switch the debug log output from this module.
 *
 * true: enables all log. | false: disables debug log.
 */
const isDebug = environment === "development";

interface ILog {
  d: (msg: unknown) => void,
  w: (msg: unknown) => void
  e: (msg: unknown) => void
}

/**
 * Log module.
 */
const Log: ILog = {
  /**
   * Output debug level log.
   */
  d: isDebug ? console.log : function() { /* nothing to do */ },
  /**
   * Output warning level log.
   */
  w: console.warn.bind(console) as (msg: string) => void,
  /**
   * Output error level log.
   */
  e: console.error.bind(console) as (msg: string) => void
};

export default Log;
