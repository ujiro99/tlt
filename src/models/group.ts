import Log from '@/services/log'
import { Tag } from '@/models/tag'

export class Group {
  // Regular expressions for parsing
  private static groupRegexp = /^\s*(#+) (.+?)( #|$)/
  private static tagRegexp = /#(.*?)(:(\d+))?(\s|$)/g

  public static test(str: string): boolean {
    return Group.groupRegexp.test(str)
  }

  public static parse(str: string): Group {
    if (Group.test(str)) {
      const m = Group.groupRegexp.exec(str)
      const title = m[2]
      const level = m[1].length
      const tags = Group.parseTags(str)
      return new Group(title, level, tags)
    }
    Log.v("Can't find task: " + str)
    return null
  }

  private static parseTags(str: string): Tag[] {
    str = str.replace(/^\s*#+/, "")
    const tags: Tag[] = []
    let match: RegExpExecArray
    while ((match = Group.tagRegexp.exec(str)) !== null) {
      const quantity = match[3] ? parseInt(match[3]) : 0
      tags.push({ name: match[1], quantity })
    }
    return tags
  }

  public title: string
  public level: number
  public tags: Tag[]

  /**
   * Constructor called only by the parse function.
   */
  private constructor(title: string, level: number, tags?: Tag[]) {
    this.title = title
    this.level = level
    this.tags = tags || []
  }

  public toString(): string {
    let str = ''.padStart(this.level, '#') + ' ' + this.title

    // tags
    if (this.tags.length > 0) {
      const tagStr = this.tags
        .map((t) => (t.quantity ? `#${t.name}:${t.quantity}` : `#${t.name}`))
        .join(' ')
      str += ` ${tagStr}`
    }
    return str
  }
}
