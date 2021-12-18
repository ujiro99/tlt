interface ITaskListState {
  text: string
  setText: (value: string) => Promise<void>
  getTextByLine: (line: number) => string
  setTextByLine: (line: number, text: string) => Promise<void>
}
