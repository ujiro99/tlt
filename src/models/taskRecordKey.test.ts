import { TaskRecordKey } from '@/models/taskRecordKey'

const table = [
  ['20220101',          ['20220101']],
  ['20220101-20220104', ['20220101', '20220102', '20220103', '20220104']],
  ['20220131-20220202', ['20220131', '20220201', '20220202']],
  ['20211231-20220102', ['20211231', '20220101', '20220102']],
  ['20220102-20211231', ['20211231', '20220101', '20220102']],
]

describe.each(table)(
  `parse %s`,
  (keyStr: string, keys: string[]) => {
    test(`returns ${JSON.stringify(keys)}`, () => {
      const key = new TaskRecordKey(keyStr)

      expect(key.keys.length).toBe(keys.length)
      key.keys.forEach((k, idx) => {
        expect(k).toBe(keys[idx])
      })
    })
  },
)

const toKeyTable = [
  ['20220101',          '20220101'],
  ['20211231-20220102', '20211231-20220102'],
  ['20220102-20211231', '20211231-20220102'],
]

describe.each(toKeyTable)(
  `toKey %s`,
  (keyStr: string, normalized: string) => {
    test(`returns ${normalized}`, () => {
      const key = new TaskRecordKey(keyStr)
      expect(key.toKey()).toBe(normalized)
    })
  },
)
