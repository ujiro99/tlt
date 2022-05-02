import React from 'react'

type Props = {
  name: string
  className?: string
}

export function Icon(props: Props): JSX.Element {
  return (
    <svg className={`Icon ${props.className}`}>
      <use xlinkHref={`/icons.svg#icon-${props.name}`} />
    </svg>
  )
}
