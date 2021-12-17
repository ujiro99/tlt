import Log from "@/services/log";

export const Icon = {

  setText(text: string): void {
    Log.v(`setText: ${text}`)
    void chrome.action.setBadgeText({
      text: text,
    });
    void chrome.action.setBadgeBackgroundColor({
      color: "#555555",
    });
  },

  clearText(): void {
    Log.v(`clearText`)
    void chrome.action.setBadgeText({
      text: "",
    });
    void chrome.action.setTitle({
      title: ""
    })
  },

  setIcon(): void {
    chrome.action.setIcon({
      path: {
        "16": "img/icon16.png",
        "48": "img/icon48.png",
        "128": "img/icon128.png",
      },
    });
  }
}
