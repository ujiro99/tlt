import { atom, selector, useRecoilState } from 'recoil'
import { STORAGE_KEY, Storage } from '@/services/storage'

const isLoggedInState = atom<boolean>({
  key: 'isLoggedInState',
  default: selector({
    key: 'isLoggedInStateSelector',
    get: async () => {
      return (await Storage.get(STORAGE_KEY.LOGIN_STATE)) as boolean
    },
  }),
  effects: [
    ({ onSet }) => {
      onSet((state) => {
        void Storage.set(STORAGE_KEY.LOGIN_STATE, state)
      })
    },
  ],
})

type Return = [isLoggedIn: boolean, setIsLoggedIn: (boolean) => void]
export function useOauthState(): Return {
  return useRecoilState(isLoggedInState)
}
