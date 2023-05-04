import React, { useState, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import { Icon } from '@/components/Icon'
import { AlarmRule } from '@/models/alarmRule'
import Log from '@/services/log'

export function AlarmTaskTextarea(): JSX.Element {
  const [text, setText] = useState('')
  const [alarms, setAlarms] = useStorage<AlarmRule[]>(STORAGE_KEY.ALARMS)

  useEffect(() => {
    if (alarms.length === 0) return
    const text = alarms
      .map((alarm) => AlarmRule.toText(alarm))
      .filter((t) => t != null)
      .join('\n')
    setText(text)
  }, [])

  const onChange = ({ target: { value } }) => {
    setText(value)
  }

  const onBlur = () => {
    const alarms = text
      .split('\n')
      .map((t) => {
        try {
          return AlarmRule.fromText(t)
        } catch (e) {
          Log.w(e)
        }
      })
      .filter((a) => a != null)
    setAlarms(alarms)
  }

  return (
    <>
      <h3 className="task-textarea__section-title">
        <Icon name="alart" />
        Alarms
      </h3>
      <TextareaAutosize
        className=""
        onChange={onChange}
        onBlur={onBlur}
        value={text}
      ></TextareaAutosize>
    </>
  )
}
