import React, { CSSProperties } from 'react'
import classnames from 'classnames'

import { Icon } from '@/components/Icon'

import './Select.css'

type Prop = {
  onChange?: React.ChangeEventHandler
  loading?: boolean
  defaultValue?: string
  value?: string
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
}

export function Select(props: Prop): JSX.Element {
  const onChange = (e) => {
    props.onChange(e)
    e.target.blur()
  }

  return (
    <div className={classnames('select', props.className)} style={props.style}>
      <select
        className={classnames('select__select', {
          'mod-loading': props.loading,
        })}
        onChange={onChange}
        defaultValue={props.defaultValue}
        value={props.value}
      >
        {props.children}
      </select>
      <Icon className="select__expand" name="expand" />
    </div>
  )
}
