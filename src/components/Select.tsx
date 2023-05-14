import React, { CSSProperties } from 'react'
import classnames from 'classnames'

import { Icon } from '@/components/Icon'

import './Select.css'

type Prop = {
  onChange?: React.ChangeEventHandler
  loading?: boolean
  defaultValue?: string
  style?: CSSProperties
  children?: React.ReactNode
}

export function Select(props: Prop): JSX.Element {
  return (
    <div className="select" style={props.style}>
      <select
        className={classnames('select__select', {
          'mod-loading': props.loading,
        })}
        onChange={props.onChange}
        defaultValue={props.defaultValue}
      >
        {props.children}
      </select>
      <Icon className="select__expand" name="expand" />
    </div>
  )
}
