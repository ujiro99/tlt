import { useCallback } from 'react'
import { atom, selector, useRecoilState } from 'recoil'

import { STORAGE_KEY, Storage } from '@/services/storage'
import { TagRecord } from '@/models/tag'

const MaxCount = 100

// for debug
// void Storage.remove(STORAGE_KEY.TASK_TAGS)

const tagRecordState = atom<TagRecord[]>({
  key: 'tagRecordState',
  default: selector({
    key: 'tagRecordStateSelector',
    get: async () => {
      const records = (await Storage.get(STORAGE_KEY.TASK_TAGS)) as TagRecord[]
      if (!records) return []
      return records
    },
  }),
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((state) => {
        // Automatically save the TagRecords.
        void Storage.set(STORAGE_KEY.TASK_TAGS, state)
      })
    },
  ],
})

interface useTagHistoryReturn {
  tags: TagRecord[]
  upsertTag: (record: TagRecord) => void
  deleteTags: (records: TagRecord[]) => void
}

export function useTagHistory(): useTagHistoryReturn {
  const [tags, setTags] = useRecoilState(tagRecordState)

  const upsertTag = useCallback(
    (record: TagRecord) => {
      if (record.name === '') return
      const newTags = tags.filter((t) => t.name !== record.name)
      newTags.push(record)

      // Limit the number of tags to save.
      if (newTags.length > MaxCount) {
        newTags.shift()
      }

      setTags(newTags)
    },
    [tags],
  )

  const deleteTags = useCallback(
    (records: TagRecord[]) => {
      const newTags = tags.filter(
        (t) => !records.some((r) => r.name === t.name),
      )
      setTags(newTags)
    },
    [tags],
  )

  return {
    tags,
    upsertTag,
    deleteTags,
  }
}
