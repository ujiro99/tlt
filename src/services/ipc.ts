type Request = {
  command: string
  param: unknown
}

type SendParam = {
  command: string
  param?: unknown
}

type IpcCallback = (param: unknown) => boolean

export const Ipc = {
  async send(param: SendParam) {
    return await chrome.runtime.sendMessage(param)
  },

  addListener(command: string, callback: IpcCallback) {
    chrome.runtime.onMessage.addListener(
      (request: Request, _: chrome.runtime.MessageSender, sendResponse) => {
        // do not use async/await here !
        const cmd = request.command
        const prm = request.param

        if (command === cmd) {
          // must return "true" if response is async.
          return callback(prm)
        }

        return false
      },
    )
  },
}
