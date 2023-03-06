import { atomFamily, useRecoilState, DefaultValue } from 'recoil'

import { Storage } from '@/services/storage'

const localPersist =
  (key) =>
  ({ onSet, setSelf, trigger }) => {
    if (trigger === 'get') {
      setSelf(async () => await Storage.get(key))
    }
    
    Storage.addListener(key, (newVal) => {
      setSelf(newVal)
    })
    
    onSet((newVal) => {
      if (newVal instanceof DefaultValue) {
        Storage.remove(key)
      } else {
        Storage.set(key, newVal)
      }
    })
  }

const storageState = atomFamily({
  key: 'storageState',
  effects: (key) => [localPersist(key)],
})

export function useStorage<P>(key: string): [P, (P) => void] {
  const [data, setData] = useRecoilState(storageState(key))
  return [data as P, setData]
}
