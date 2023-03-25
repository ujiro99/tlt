import { useRecoilValue } from 'recoil'
import { savingState } from '@/hooks/useTaskStorage'

type StorageWatcher = [isSaving: boolean]
export function useStorageWatcher(): StorageWatcher {
  const saving = useRecoilValue(savingState)
  return [saving]
}
