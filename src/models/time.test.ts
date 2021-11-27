import { Time } from "@/models/time"

const SECOND_MS = 1000
const MINUTE_MS = 60 * SECOND_MS
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const MINUTE_S = 60
const HOUR_S = 60 * MINUTE_S

describe('parse milli seconds to time', () => {
  test('60 * 1000 [ms] -> "1m"', () => {
    const time = Time.parseMs(MINUTE_MS)
    expect(time.toString()).toBe("1m")
  });

  test('2 * 60 * 1000 [ms] -> "2m"', () => {
    const time = Time.parseMs(2 * MINUTE_MS)
    expect(time.toString()).toBe("2m")
  });

  test('70085 [ms] -> "1m"', () => {
    const time = Time.parseMs(70085)
    expect(time.minutes).toBe(1)
    expect(time.seconds).toBe(10)
  });

  test('60 * 60 * 1000 [ms] -> "1h"', () => {
    const time = Time.parseMs(HOUR_MS)
    expect(time.toString()).toBe("1h")
  });

  test('60 * 60 * 1000 + 60 * 1000 [ms] -> "1h1m"', () => {
    const time = Time.parseMs(HOUR_MS + MINUTE_MS)
    expect(time.toString()).toBe("1h1m")
  });

  test('24 * 60 * 60 * 1000 [ms] -> "1d"', () => {
    const time = Time.parseMs(DAY_MS)
    expect(time.toString()).toBe("1d")
  });
})

describe('parse seconds to time', () => {
  test('60 [s] -> "1m"', () => {
    const time = Time.parseSecond(MINUTE_S)
    expect(time.toString()).toBe("1m")
  });

  test('61 [s] -> "1m"', () => {
    const time = Time.parseSecond(MINUTE_S + 1)
    expect(time.toString()).toBe("1m")
  });

  test('120 [s] -> "2m"', () => {
    const time = Time.parseSecond(MINUTE_S * 2)
    expect(time.toString()).toBe("2m")
  });

  test('60 * 60 [s] -> "1h"', () => {
    const time = Time.parseSecond(MINUTE_S * 60)
    expect(time.toString()).toBe("1h")
  });

  test('60 * 60 * 2.5 [s] -> "2h30m"', () => {
    const time = Time.parseSecond(MINUTE_S * 60 * 2.5)
    expect(time.toString()).toBe("2h30m")
  });

  test('60 * 60 * 24 [s] -> "1d"', () => {
    const time = Time.parseSecond(MINUTE_S * 60 * 24)
    expect(time.toString()).toBe("1d")
  });

  test('60 * 60 * 24 * 2.5 [s] -> "2d12h"', () => {
    const time = Time.parseSecond(MINUTE_S * 60 * 24 * 2.5)
    expect(time.toString()).toBe("2d12h")
  });
})

describe('parse string to time', () => {
  test('"1m" -> 1 minutes', () => {
    const time = Time.parseStr("1m");
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('"1h" -> 1 hours', () => {
    const time = Time.parseStr("1h");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(0)
  })

  test('"1d" -> 1 days', () => {
    const time = Time.parseStr("1d");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(1)
  })

  test('"2d" -> 2 days', () => {
    const time = Time.parseStr("2d");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(2)
  })

  test('"1d1m" -> 1 days and 1 minutes', () => {
    const time = Time.parseStr("1d1m");
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(1)
  })

  test('"1x" (invalid format) -> 0', () => {
    const time = Time.parseStr("1x");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('"1 m" (invalid format) -> 0', () => {
    const time = Time.parseStr("1 x");
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })
})

describe('add', () => {
  test('1m + 1m -> 2m', () => {
    const time = Time.parseStr("1m");
    const timeB = Time.parseStr("1m");
    time.add(timeB)
    expect(time.minutes).toBe(2)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(0)
  })

  test('1m + 1h -> 1h 1m', () => {
    const time = Time.parseStr("1m");
    const timeB = Time.parseStr("1h");
    time.add(timeB)
    expect(time.minutes).toBe(1)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(0)
  })

  test('1d + 1h -> 1d 1h', () => {
    const time = Time.parseStr("1d");
    const timeB = Time.parseStr("1h");
    time.add(timeB)
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(1)
    expect(time.days).toBe(1)
  })

})

describe('isEmpty', () => {
  test('0 returns true', () => {
    const time = new Time()
    expect(time.isEmpty()).toBe(true)
  })

  test('1 seconds returns true', () => {
    const time = Time.parseSecond(1)
    expect(time.isEmpty()).toBe(true)
  })

  test('1 minutes returns false', () => {
    const time = new Time(1)
    expect(time.isEmpty()).toBe(false)
  })
})

describe('toClockString', () => {
  test('0 returns 00:00:00', () => {
    const time = new Time()
    expect(time.toClockString()).toBe('00:00:00')
  })

  test('1 seconds tobe 00:00:01', () => {
    const time = Time.parseSecond(1)
    expect(time.toClockString()).toBe('00:00:01')
  })

  test('121 seconds tobe 00:02:01', () => {
    const time = Time.parseSecond(121)
    expect(time.toClockString()).toBe('00:02:01')
  })

  test('1h 1m ls tobe 01:01:01', () => {
    const time = Time.parseSecond(60 * 60 + 61)
    expect(time.toClockString()).toBe('01:01:01')
  })

  test('1d 1h 1m tobe 1d 01:01:00', () => {
    const time = new Time(1, 1, 1)
    expect(time.toClockString()).toBe('1d 01:01:00')
  })
})

describe('calculateCarryUp', () => {
  test('23:59:59 + 00:00:01 returns 1d 00:00:00', () => {
    const timeA = Time.parseSecond(23 * HOUR_S + 59 * MINUTE_S + 59)
    const timeB = Time.parseSecond(1)
    const time = timeA.add(timeB)

    expect(time.seconds).toBe(0)
    expect(time.minutes).toBe(0)
    expect(time.hours).toBe(0)
    expect(time.days).toBe(1)
  })
})
