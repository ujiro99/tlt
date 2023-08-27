import React from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { position } from 'caret-pos'
import { useTagHistory } from '@/hooks/useTagHistory'
import { t } from '@/services/i18n'
import { Parser } from '@/services/parser'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { useTimeHistory } from '@/hooks/useTimeHistory'

import './Autocomplete.css'
import '@/css/fadeIn.css'
import '@/css/collapse.css'

type AutocompleteProps = {
  text: string
  editorRef: React.RefObject<HTMLTextAreaElement>
  onComplete: (value: string) => void
}

type complete = {
  action: () => void
  value: string
  name: string
}

export function Autocomplete(props: AutocompleteProps): JSX.Element {
  const { tags } = useTagHistory()
  const { times } = useTimeHistory()
  const ref = props.editorRef
  const node = Parser.parseLine(props.text)
  const nodeType = node ? node.type : null
  const items: complete[] = []
  const isTask = nodeType === NODE_TYPE.TASK

  let containerStyle = { left: 0, top: 0 }
  if (ref && ref.current) {
    const refRect = ref.current.getBoundingClientRect()
    const pos = position(ref.current)
    containerStyle = { left: pos.left - 10, top: refRect.height }
  }

  if (isTask) {
    const task = node.data as Task
    if (
      task.estimatedTimes &&
      task.estimatedTimes.isEmpty() &&
      task.title != null &&
      task.title.length > 1
    ) {
      times.forEach((time) => {
        items.push({
          name: t('autocomplete_estimated'),
          value: '~/' + time,
          action: addHoursFn('~/' + time),
        })
      })
    }
    if (task.title != null && task.title.length > 1) {
      tags.forEach((tag) => {
        const found = task.tags.find((t) => t.name === tag.name)
        if (!found) {
          items.push({
            name: t('autocomplete_tag'),
            value: '#' + tag.name,
            action: addTagsFn('#' + tag.name),
          })
        }
      })
    }
    console.log(items)
  }

  function addHoursFn(val: string) {
    return () => {
      props.onComplete(props.text + ' ' + val)
    }
  }

  function addTagsFn(val: string) {
    return () => {
      props.onComplete(props.text + ' ' + val)
    }
  }

  return (
    <div className="autocomplete" style={containerStyle}>
      <TransitionGroup component="ul" className="autocomplete__menu">
        {items.map((item) => (
          <CSSTransition
            key={item.name + item.value}
            timeout={200}
            classNames="collapse"
            unmountOnExit
          >
            <li
              className="autocomplete__list"
              key={item.name + item.value}
              style={{ '--height': '28px' } as any}
            >
              <button className="autocomplete__item" onClick={item.action}>
                <span className="autocomplete__value">{item.value}</span>
                <span className="autocomplete__name">{item.name}</span>
              </button>
            </li>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}
