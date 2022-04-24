import React, { useState, useRef, useEffect } from 'react'

import styles from './ButtonGroup.module.css'

type ButtonData = {
  name: string
  label: string
  iconName: string
}

type OnChangeEvent = {
  name: string
}

type ButtonGroupProps = {
  buttons: ButtonData[]
  onChange: (e: OnChangeEvent) => void
  initial: string
}

export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const [selected, setSelected] = useState<string>(props.initial)
  const [bgLeft, setBgLeft] = useState(0)
  const ref = useRef<HTMLButtonElement>()

  const onClick = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    setSelected(e.currentTarget.name)
    props.onChange({ name: e.currentTarget.name })
  }

  useEffect(() => {
    setTimeout(() => {
      const left = ref.current?.offsetLeft
      setBgLeft(left)
    })
  }, [selected, props.buttons])

  return (
    <div className={styles.ButtonGroup}>
      <div className={styles.wrapper}>
        <div className={styles.bgWrapper}>
          {props.buttons.map((b) => (
            <div className={styles.bg} key={b.name} />
          ))}
        </div>
        <span className={`${styles.selectedBg}`} style={{ left: bgLeft }} />
        {props.buttons.map((button) => {
          const _selected = selected === button.name
          return (
            <button
              className={`${styles.button} ${
                _selected ? styles.selected : null
              }`}
              name={button.name}
              key={button.name}
              onClick={onClick}
              ref={_selected ? ref : null}
            >
              <svg className={styles.icon}>
                <use xlinkHref={`/icons.svg#${button.iconName}`} />
              </svg>
              <span className={styles.label}>{button.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
