import { useRecoilValue } from 'recoil'
import { savingState } from '@/hooks/useTaskManager'

type StorageWatcher = [isSaving: boolean]
export function useStorageWatcher(): StorageWatcher {
  const saving = useRecoilValue(savingState)
  return [saving]
}
