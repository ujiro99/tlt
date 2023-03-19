import React, { useState, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import { SketchPicker, ColorResult } from 'react-color'
import { unique } from '@/services/util'
import { BasePicker, BasePickerProps } from '@/components/BasePicker'

const PresetMax = 16

const PresetColors = [
  '#e91e63',
  '#f78da7',
  '#f47373',
  '#dce775',
  '#37d67a',
  '#009688',
  '#2ccce4',
  '#4a90e2',
  '#ba68c8',
  '#d9e3f0',
  '#697689',
  '#555555',
]

type Props = {
  refElm: Element
  onChange: (color: ColorResult) => void
  onChangeComplete: (color: ColorResult) => void
  initialColor: string
  presetColors?: string[]
} & BasePickerProps

export const ColorPicker = (props: Props): JSX.Element => {
  const [visible, setVisible] = useState(false)
  let presets = unique(props.presetColors) || []
  if (presets.length < PresetMax) {
    presets = unique(presets.concat(PresetColors))
    if (presets.length > PresetMax) {
      presets = presets.slice(0, PresetMax)
    }
  }

  useEffect(() => {
    window.setTimeout(() => {
      // Wait for SketchPicker to initialize before making the picker visible
      setVisible(true)
    }, 100)
  }, [])

  return (
    <CSSTransition in={visible} timeout={200} classNames="fade" unmountOnExit>
      <BasePicker onRequestClose={props.onRequestClose} refElm={props.refElm}>
        <SketchPicker
          disableAlpha={true}
          color={props.initialColor}
          onChange={props.onChange}
          onChangeComplete={props.onChangeComplete}
          presetColors={presets}
        />
      </BasePicker>
    </CSSTransition>
  )
}
