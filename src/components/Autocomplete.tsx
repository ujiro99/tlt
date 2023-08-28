import React, { useRef, useState, useEffect, forwardRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { position } from 'caret-pos'
import classnames from 'classnames'
import { useTagHistory } from '@/hooks/useTagHistory'
import { useTimeHistory } from '@/hooks/useTimeHistory'
import { t } from '@/services/i18n'
import { Parser } from '@/services/parser'
import { NODE_TYPE } from '@/models/node'
import { Task } from '@/models/task'
import { KEYCODE_ENTER } from '@/const'

import './Autocomplete.css'
import '@/css/fadeIn.css'
import '@/css/collapse.css'

const RegexpToken = /\s$/
const RegexpQuery = /\S+$/

type AutocompleteProps = {
  text: string
  editorRef: React.RefObject<HTMLTextAreaElement>
  onComplete: (value: string) => void
  onVisibleChange: (visible: boolean) => void
}

type CompleteItem = {
  action: () => void
  value: string
  name: string
}

export const Autocomplete = forwardRef<HTMLDivElement, AutocompleteProps>(
  (props: AutocompleteProps, ref) => {
    const { tags } = useTagHistory()
    const { times } = useTimeHistory()
    const [cursor, setCursor] = useState(-1)
    const tokenPosition = useRef(0)
    const editorRef = props.editorRef
    const node = Parser.parseLine(props.text)
    const nodeType = node ? node.type : null
    const isTask = nodeType === NODE_TYPE.TASK

    if (RegexpToken.test(props.text)) {
      let pos = position(editorRef.current)
      tokenPosition.current = pos.left
    }

    let containerStyle = { left: 0, top: 0 }
    if (editorRef && editorRef.current) {
      const refRect = editorRef.current.getBoundingClientRect()
      console.warn(refRect)
      containerStyle = { left: tokenPosition.current - 12, top: refRect.height }
    }

    let items: CompleteItem[] = []
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
            action: handleClick('~/' + time),
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
              action: handleClick('#' + tag.name),
            })
          }
        })
      }
    }

    let query = ''
    if (RegexpQuery.test(props.text)) {
      query = RegexpQuery.exec(props.text)[0]
      items = items.filter((item) => {
        return item.value.indexOf(query) >= 0
      })
    }

    const visible = items.length > 0 && tokenPosition.current > 0

    useEffect(() => {
      props.onVisibleChange(visible)
    }, [visible])

    useEffect(() => {
      setCursor(-1)
    }, [items.length])

    function handleClick(val: string) {
      return () => {
        const r = new RegExp(query + '$')
        props.onComplete(props.text.replace(r, val))
      }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
      let newCursor: number
      if (e.keyCode === KEYCODE_ENTER) {
        handleClick(items[cursor].value)()
      } else if (e.key === 'ArrowUp') {
        newCursor = cursor === 0 ? items.length - 1 : cursor - 1
      } else if (e.key === 'ArrowDown') {
        newCursor = (cursor + 1) % items.length
      }
      setCursor(newCursor)
    }

    return (
      <div
        className="autocomplete"
        style={containerStyle}
        onKeyDown={handleKeyDown}
        ref={ref}
      >
        {visible && (
          <TransitionGroup component="ul" className="autocomplete__menu">
            {items.map((item, idx) => (
              <CSSTransition
                key={item.name + item.value}
                timeout={200}
                classNames="collapse"
                unmountOnExit
              >
                <li
                  className={classnames('autocomplete__list', {
                    'autocomplete__list--focus': idx === cursor,
                  })}
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
        )}
      </div>
    )
  },
)
