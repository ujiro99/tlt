import React from 'react'
import { position } from 'caret-pos'
import { t } from '@/services/i18n'
import { Parser } from '@/services/parser'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'

import './Autocomplete.css'

type AutocompleteProps = {
  text: string
  editorRef: React.RefObject<HTMLTextAreaElement>
  onComplete: (value: string) => void
}

export function Autocomplete(props: AutocompleteProps): JSX.Element {
  const ref = props.editorRef
  const node = Parser.parseLine(props.text)
  const nodeType = node ? node.type : null
  const isTask = nodeType === NODE_TYPE.TASK
  let activeComplete = false
  let activeHours = false

  let autocompleteStyle = { left: 0, top: 0 }
  if (ref && ref.current) {
    const refRect = ref.current.getBoundingClientRect()
    const pos = position(ref.current)
    autocompleteStyle = { left: pos.left, top: refRect.height }
  }

  if (isTask) {
    const task = node.data as Task
    activeHours = task.estimatedTimes && task.estimatedTimes.isEmpty()
  }

  activeComplete = activeHours

  function addHours() {
    props.onComplete(props.text + ' ~/1h')
  }

  return (
    activeComplete &&
    isTask && (
      <div className="autocomplete" style={autocompleteStyle}>
        <ul>
          {activeHours && (
            <li>
              <button className="autocomplete__item" onClick={addHours}>
                <span className="autocomplete__value">~/1h</span>
                <span className="autocomplete__name">
                  {t('autocomplete_estimated')}
                </span>
              </button>
            </li>
          )}
        </ul>
      </div>
    )
  )
}
