import { atomFamily, useRecoilState } from 'recoil'

export const MODAL = {
  SYNC: 'sync',
  ALARM: 'alarm',
}
type Modal = (typeof MODAL)[keyof typeof MODAL]

const modalVisibleState = atomFamily<boolean, Modal>({
  key: 'modalVisibleState',
  default: false,
})

type Return = [visible: boolean, setVisible: (visible: boolean) => void]

export function useModal(modal: Modal): Return {
  const [visible, setVisible] = useRecoilState(modalVisibleState(modal))
  return [visible, setVisible]
}
