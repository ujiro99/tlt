import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { ColorResult } from 'react-color'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTagHistory } from '@/hooks/useTagHistory'
import { Menu, Item, useContextMenu } from '@/lib/react-contexify'
import { Icon } from '@/components/Icon'
import { ColorPicker } from '@/components/ColorPicker'
import { ItemConfirm } from '@/components/ContextMenu/ItemConfirm'
import { eventStop } from '@/services/util'
import { t } from '@/services/i18n'
import { TagRecord } from '@/models/tag'
import { COLOR } from '@/const'

import 'react-contexify/ReactContexify.css'
import '@/components/ContextMenu.css'

type TagContextMenuProps = {
  id: string
  tag: TagRecord
  tagRef: React.MutableRefObject<Element>
  enableDelete?: boolean
}

function Portal({ children }) {
  return createPortal(children, document.getElementById('popup'))
}

export const TagContextMenu = (props: TagContextMenuProps) => {
  const tag = props.tag
  const manager = useTaskManager()
  const [menuVisible, setMenuVisible] = useState(false)
  const [pickerVisible, setPickerVisible] = useState(false)
  const { tags, upsertTag, deleteTags } = useTagHistory()
  const { hideAll } = useContextMenu()
  const presetColors = tags.map((t) => t.colorHex).reverse()
  const tagRecord = tags.find((t) => t.name === tag.name)
  const bgColor = tagRecord?.colorHex || COLOR.Gray200
  
  function clickBackdrop(e) {
    hideAll()
    eventStop(e)
  }

  function handleItemClick({ id = '', triggerEvent }) {
    switch (id) {
      case 'delete':
        deleteTags([props.tag])
        break
      case 'color':
        setPickerVisible(true)
        break
    }
    eventStop(triggerEvent)
  }

  function deleteDisabled() {
    return manager.tags.some((tag) => tag.name === props.tag.name)
  }

  const changeColor = (color: ColorResult) => {
    upsertTag({ name: tag.name, colorHex: color.hex })
  }

  return (
    <Portal>
      {menuVisible && (
        <div
          className="TagButton--backdrop"
          onClick={clickBackdrop}
          onContextMenu={eventStop}
          onDragStart={eventStop}
          onPointerDown={eventStop}
          data-name={props.tag.name}
        />
      )}
      <Menu
        className="context-menu"
        id={props.id}
        onVisibilityChange={setMenuVisible}
      >
        <Item id="color" onClick={handleItemClick}>
          <div className="context-menu__color">
            <Icon className="context-menu__color-icon" name="palette" />
            <span>{t('tag_change_color')}</span>
          </div>
        </Item>
        {props.enableDelete && (
          <ItemConfirm
            id="delete"
            onClick={handleItemClick}
            className="context-menu__delete"
            label={t('tag_delete_from_history')}
            labelConfirm={t('tag_delete_from_history_confirm')}
            iconName="delete"
            disabled={deleteDisabled}
          />
        )}
      </Menu>

      {pickerVisible ? (
        <ColorPicker
          onRequestClose={() => setPickerVisible(false)}
          onChange={changeColor}
          onChangeComplete={changeColor}
          initialColor={bgColor}
          refElm={props.tagRef.current}
          presetColors={presetColors}
        />
      ) : null}
    </Portal>
  )
}
