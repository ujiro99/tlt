import React from 'react'
import { SketchPicker, ColorResult } from 'react-color'
import { unique } from '@/services/util'
import { BasePicker, BasePickerProps } from '@/components/BasePicker'

const PickerSize = {
  w: 220,
  h: 300,
}

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
  onChange: (color: ColorResult) => void
  onChangeComplete: (color: ColorResult) => void
  initialColor: string
  presetColors?: string[]
} & BasePickerProps

export const ColorPicker = (props: Props): JSX.Element => {
  let presets = unique(props.presetColors) || []
  if (presets.length < PresetMax) {
    presets = unique(presets.concat(PresetColors))
    if (presets.length > PresetMax) {
      presets = presets.slice(0, PresetMax)
    }
  }

  return (
    <BasePicker
      onRequestClose={props.onRequestClose}
      position={props.position}
      size={PickerSize}
    >
      <SketchPicker
        disableAlpha={true}
        color={props.initialColor}
        onChange={props.onChange}
        onChangeComplete={props.onChangeComplete}
        presetColors={presets}
      />
    </BasePicker>
  )
}
