import { atom, useRecoilState } from 'recoil'

const modalVisibleState = atom<boolean>({
  key: 'modalVisibleState',
  default: false,
})

type Return = [visible: boolean, setVisible: (visible: boolean) => void]

export function useSyncModal(): Return {
  const [visible, setVisible] = useRecoilState(modalVisibleState)
  return [visible, setVisible]
}
