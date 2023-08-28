import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useEditable } from '@/hooks/useEditable'
import { LineEditor } from '@/components/LineEditor'
import * as i18n from '@/services/i18n'
import { useAnalytics } from '@/hooks/useAnalytics'

import './EmptyLine.css'

export function EmptyLine(): JSX.Element {
  const manager = useTaskManager()
  const analytics = useAnalytics()
  const line = manager.lineCount + 1
  const [isEditing, _, edit] = useEditable(line)

  const onClick = () => {
    analytics.track('click new ToDo')
    edit()
  }

  if (isEditing) {
    return (
      <div tabIndex={0} className="empty-line--edit">
        <LineEditor className="m-2" line={line} />
      </div>
    )
  }

  return (
    <div tabIndex={0} className="empty-line" onClick={onClick}>
      <span className="empty-line__label">{i18n.t('new_todo')}</span>
    </div>
  )
}
