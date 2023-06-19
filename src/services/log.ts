import { isDebug } from '@/const'

/**
 * Do not usually display.
 */
const verbose = false

interface ILog {
  v: (msg: unknown) => void
  d: (msg: unknown) => void
  w: (msg: unknown) => void
  e: (message?: any, ...optionalParams: any[]) => void
}

const nop = () => {
  /* nothing to do */
}

/**
 * Log module.
 */
const Log: ILog = {
  /**
   * Output verbose level log.
   */
  v: verbose ? console.debug : nop,
  /**
   * Output debug level log.
   */
  d: isDebug ? console.log : nop,
  /**
   * Output warning level log.
   */
  w: console.warn.bind(console) as (msg: string) => void,
  /**
   * Output error level log.
   */
  e: console.error.bind(console) as (msg: string) => void,
}

export default Log
