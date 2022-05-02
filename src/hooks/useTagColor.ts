import { useCallback } from 'react'
import { atom, selector, useRecoilState } from 'recoil'

import { STORAGE_KEY, Storage } from '@/services/storage'
import { TagRecord } from '@/models/tag'

const MAX_COUNT = 100

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

interface useTagColorReturn {
  tags: TagRecord[]
  setTag: (record: TagRecord) => void
}

export function useTagColor(): useTagColorReturn {
  const [tags, setTags] = useRecoilState(tagRecordState)

  const setTag = useCallback(
    (record: TagRecord) => {
      let found = false
      const newTags = tags.map((t) => {
        if (t.name === record.name) {
          found = true
          return record
        }
        return t
      })
      if (!found) {
        newTags.push(record)
      }

      // Limit the number of tags to save.
      if (newTags.length > MAX_COUNT) {
        newTags.shift()
      }

      setTags(newTags)
    },
    [tags],
  )

  return {
    tags,
    setTag,
  }
}
