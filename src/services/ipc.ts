type SendParam = {
  command: string
  param?: unknown
}

export const Ipc = {
  send: (param: SendParam): void => {
    chrome.runtime.sendMessage(param)
  },
}
