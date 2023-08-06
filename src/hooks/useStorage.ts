import { atomFamily, useRecoilState, DefaultValue } from 'recoil'
import { Storage, StorageKey } from '@/services/storage'

const localPersist =
  (key: StorageKey) =>
    ({ onSet, setSelf, trigger }) => {
      if (trigger === 'get') {
        setSelf(async () => {
          return await Storage.get(key)
        })
      }

      Storage.addListener(key, (newVal) => {
        setSelf(newVal)
      })

      onSet(async (newVal: any) => {
        if (newVal instanceof DefaultValue) {
          await Storage.remove(key)
        } else {
          await Storage.set(key, newVal)
        }
      })
    }

const storageState = atomFamily({
  key: 'storageState',
  effects: (key: StorageKey) => [localPersist(key)],
})

export function useStorage<P>(key: StorageKey, _default?: P): [P, (P: any) => void] {
  const [data, setData] = useRecoilState(storageState(key))
  if (data == null) {
    return [_default, setData]
  }
  return [data as P, setData]
}
