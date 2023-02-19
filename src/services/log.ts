import { isDebug } from '@/const'

/**
 * Do not usually display.
 */
const verbose = true

interface ILog {
  v: (msg: unknown) => void
  d: (msg: unknown) => void
  w: (msg: unknown) => void
  e: (msg: unknown) => void
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
  v: verbose ? console.log : nop,
  /**
   * Output debug level log.
   */
  d: isDebug ? console.debug : nop,
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
