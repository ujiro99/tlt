import React, { Suspense, useEffect, useState } from 'react'
import { CSSTransition } from 'react-transition-group'
import { useQuery } from 'react-query'
import { useStorage } from '@/hooks/useStorage'
import { STORAGE_KEY } from '@/services/storage'
import {
  GoogleCalendar,
  CalendarColor,
  COLOR_TYPE,
} from '@/services/google/calendar'
import { BasePicker, BasePickerProps } from '@/components/BasePicker'
import { useAnalytics } from '@/hooks/useAnalytics'

import '@/css/fadeIn.css'
import './CalendarColorPicker.css'

const fetchColors = () => {
  return useQuery({
    queryKey: ['color'],
    queryFn: GoogleCalendar.fetchColors,
    staleTime: 5 * 60 * 1000,
  })
}

type ColorStorage = {
  [COLOR_TYPE.CALENDAR]: CalendarColor
  [COLOR_TYPE.EVENT]: CalendarColor
}

type CalendarColorsProps = {
  type: string
  defaultId: string
  onChangeColor: (color: CalendarColor) => void
}

function Inner(props: CalendarColorsProps): JSX.Element {
  const analytics = useAnalytics()
  const [visible, setVisible] = useState(false)
  const [refElm, setRefElm] = useState(null)
  const [colors, setColors] = useStorage<ColorStorage>(
    STORAGE_KEY.CALENDAR_COLOR,
  )
  const { data } = fetchColors()
  const color =
    colors[props.type] ||
    data.find(
      (c) => c.type === COLOR_TYPE.CALENDAR && c.id === props.defaultId,
    ) ||
    ({} as CalendarColor)
  const colorsApi = data.filter((c) => c.type === props.type)

  const onClick = (e) => {
    analytics.track('click calendar color')
    setVisible(true)
  }

  const onChange = async (c) => {
    const newColor = {
      ...colors,
      [props.type]: c,
    }
    setColors(newColor)
    setVisible(false)
    props.onChangeColor(c)
  }

  useEffect(() => {
    props.onChangeColor(colors[props.type])
  }, [])

  return (
    <>
      <button
        className="calendar-color__item"
        style={{ backgroundColor: color.background }}
        onClick={onClick}
        ref={setRefElm}
      />
      <ColorPicker
        visible={visible}
        refElm={refElm}
        colors={colorsApi}
        onSelect={onChange}
        onRequestClose={() => setVisible(false)}
      />
    </>
  )
}

export function CalendarColorPicker(props: CalendarColorsProps): JSX.Element {
  if (props.defaultId == null) {
    return <></>
  }
  return (
    <div className="calendar-color">
      <Suspense
        fallback={<div className="calendar-color__item mod-loading"></div>}
      >
        <Inner {...props} />
      </Suspense>
    </div>
  )
}

type ColorPickerProps = {
  visible: boolean
  colors: CalendarColor[]
  onSelect: (color: CalendarColor) => void
} & BasePickerProps

const ColorPicker = (props: ColorPickerProps): JSX.Element => {
  const colors = props.colors

  const click = (e) => {
    const id = e.target.value
    const c = colors.find((c) => c.id === id)
    props.onSelect(c)
  }

  return (
    <CSSTransition
      in={props.visible}
      timeout={200}
      classNames="fade"
      unmountOnExit
    >
      <BasePicker
        onRequestClose={props.onRequestClose}
        refElm={props.refElm}
        location='top'
      >
        <div className="color-picker">
          <ul className="color-picker__list">
            {colors.map((color) => {
              return (
                <li className="color-picker__li" key={color.id}>
                  <button
                    className="color-picker__item"
                    value={color.id}
                    style={{ backgroundColor: color.background }}
                    onClick={click}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </BasePicker>
    </CSSTransition>
  )
}
