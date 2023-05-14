import { atomFamily, useRecoilState, DefaultValue } from 'recoil'
import { Storage, StorageKey, DEFAULTS } from '@/services/storage'

const localPersist =
  (key) =>
  ({ onSet, setSelf, trigger }) => {
    if (trigger === 'get') {
      setSelf(async () => {
        const val = await Storage.get(key)
        return val === undefined ? DEFAULTS[key] : val
      })
    }

    Storage.addListener(key, (newVal) => {
      setSelf(newVal)
    })

    onSet(async (newVal) => {
      if (newVal instanceof DefaultValue) {
        await Storage.remove(key)
      } else {
        await Storage.set(key, newVal)
      }
    })
  }

const storageState = atomFamily({
  key: 'storageState',
  effects: (key) => [localPersist(key)],
})

export function useStorage<P>(key: StorageKey): [P, (P) => void] {
  const [data, setData] = useRecoilState(storageState(key))
  return [data as P, setData]
}
