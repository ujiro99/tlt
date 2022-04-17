import { Group } from '@/models/group'

const testParseTable = [
  ['# title',              1, []],
  ['## title',             2, []],
  ['# title #tag',         1, ["tag"]],
  ['## title #tag #sp:3',  2, ["tag", "sp"]],
]

describe.each(testParseTable)(
  `parse %s`, (str: string, level: number, tags: string[]) => {
    const g = Group.parse(str)

    test(`title toBe title`, () => {
      expect(g.title).toBe("title")
    })

    test(`level toBe $${level}`, () => {
      expect(g.level).toBe(level)
    })

    test(`tags found`, () => {
      g.tags.forEach((t) => {
        const found = tags.find((tt) => tt === t.name)
        expect(t.name).toBe(found)
      })
    })

    test(`toString returns same string.`, () => {
      expect(g.toString()).toBe(str)
    })
  },
)
