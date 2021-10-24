import { TodoItem } from '@/models/todoItem'

describe.each([
    ["- [ ] todo title", "todo title", ""],
    ["- [x] todo title", "todo title", ""],
    ["- [ ] todotitle ~2h", "todotitle", "2h"],
    ["- [ ] todo title ~30m #sp:1", "todo title", "30m"],
  ])(`parse %s`, (str: string, title: string, time: string) => {

  test(`returns ${title} ${time}`, () => {
    const todo = TodoItem.parse(str)
    expect(todo.title).toBe(title)
    expect(todo.actualTimes.toString()).toBe(time)
  })

})
