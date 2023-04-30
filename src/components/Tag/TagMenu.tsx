import React, { useState } from 'react'
import classnames from 'classnames'
import { TagPicker } from '@/components/Tag/TagPicker'
import { Icon } from '@/components/Icon'
import { eventStop } from '@/services/util'
import { Tag } from '@/models/tag'
import { useAnalytics } from '@/hooks/useAnalytics'

import './TagMenu.css'

export type TagMenuProps = {
  tags: Tag[]
  onChangeTags: (tags: Tag[]) => void
  menuOpened?: (opened: boolean) => void
}

export function TagMenu(props: TagMenuProps): JSX.Element {
  const [pickerVisible, setPickerVisible] = useState(false)
  const [refElm, setRefElm] = useState(null)
  const analytics = useAnalytics()

  const showPicker = (e: React.MouseEvent | MouseEvent) => {
    eventStop(e)
    setPickerVisible(true)
    props.menuOpened && props.menuOpened(true)
    analytics.track('TagPicker open')
  }

  const closePicker = () => {
    setPickerVisible(false)
    props.menuOpened && props.menuOpened(false)
    analytics.track('TagPicker close')
  }

  const className = classnames('TagMenu', {
    'TagMenu--show-picker': pickerVisible,
  })

  return (
    <>
      <div className={className} onClick={showPicker} ref={setRefElm}>
        <Icon name="tag" />
      </div>
      <TagPicker
        visible={pickerVisible}
        refElm={refElm}
        onRequestClose={closePicker}
        onChange={props.onChangeTags}
        initialTags={props.tags} // Not omitted here.
      />
    </>
  )
}
