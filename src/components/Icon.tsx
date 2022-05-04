import React from 'react'
import classnames from 'classnames'

type Props = {
  name: string
  className?: string
}

export function Icon(props: Props): JSX.Element {
  return (
    <svg className={classnames('Icon', props.className)}>
      <use xlinkHref={`/icons.svg#icon-${props.name}`} />
    </svg>
  )
}
