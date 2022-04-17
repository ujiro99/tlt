import { Group } from '@/models/group'

const testParseTable = [
  ['# title',              1, [], []],
  ['## title',             2, [], []],
  ['# title #tag',         1, ["tag"], [0]],
  ['## title #tag #sp:3',  2, ["tag", "sp"], [0, 3]],
  ['## title #s:1000',     2, ["s"],         [1000]],
]

describe.each(testParseTable)(
  `parse %s`, (str: string, level: number, tags: string[], quantities: number[]) => {
    const g = Group.parse(str)

    test(`title toBe title`, () => {
      expect("title").toBe(g.title)
    })

    test(`level toBe $${level}`, () => {
      expect(level).toBe(g.level)
    })

    test(`found tag`, () => {
      g.tags.forEach((t) => {
        const found = tags.find((tt) => tt === t.name)
        expect(found).toBe(t.name)
      })
    })

    test(`tags quantity.`, () => {
      g.tags.forEach((t) => {
        const found = tags.findIndex((tt) => tt === t.name)
        const quantity = quantities[found]
        expect(quantity).toBe(t.quantity)
      })
    })

    test(`toString returns same string.`, () => {
      expect(str).toBe(g.toString())
    })
  },
)
