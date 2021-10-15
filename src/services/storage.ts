import Log from "@/services/log";

const Storage = {
  /**
   * Get a item from chrome local storage.
   *
   * @param {string} key of item in storage.
   */
  get: (key: string): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(key, function (result) {
        Log.d("storage get: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          Log.d(result[key]);
          resolve(result[key]);
        }
      });
    });
  },

  /**
   * Set a item to chrome local storage.
   *
   * @param {string} key key of item.
   * @param {any} value item.
   */
  set: (key: string, value: unknown): Promise<boolean|chrome.runtime.LastError> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, function () {
        Log.d("storage set: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  },

  /**
   * Remove a item in chrome local storage.
   *
   * @param {string} key key of item.
   */
  remove: (key: string): Promise<boolean|chrome.runtime.LastError> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(key, function () {
        Log.d("storage remove: " + key);
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  },

  /**
   * Clear all items in chrome local storage.
   */
  clear: (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(function () {
        Log.d("clear");
        if (chrome.runtime.lastError != null) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(true);
        }
      });
    });
  },
};

export default Storage;
