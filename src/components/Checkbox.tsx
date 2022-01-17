import React from 'react'

import '@/components/Checkbox.css'

type CheckboxProps = {
  id: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function Checkbox(props: CheckboxProps): JSX.Element {
  // Stop event bubbling to avoid editting.
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div className="checkbox" onClick={stopPropagation}>
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
