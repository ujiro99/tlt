import React from 'react'

import '@/components/Checkbox.css'

type CheckboxProps = {
  id: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  return (
    <div className="checkbox">
      <input
        id={props.id}
        type="checkbox"
        checked={props.checked}
        onChange={props.onChange}
      />
      <label htmlFor={props.id}></label>
    </div>
  )
}
