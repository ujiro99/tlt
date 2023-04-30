import React from 'react'
import { useTaskManager } from '@/hooks/useTaskManager'
import { useTagHistory } from '@/hooks/useTagHistory'
import { Menu, Item, useContextMenu } from '@/lib/react-contexify'
import { Icon } from '@/components/Icon'
import { eventStop } from '@/services/util'
import { t } from '@/services/i18n'
import { TagRecord } from '@/models/tag'

import 'react-contexify/ReactContexify.css'
import '@/components/ContextMenu.css'

type TagContextMenuProps = {
  id: string
  tag: TagRecord
  visible: boolean
  onVisibilityChange: (visible: boolean) => void
}

export const TagContextMenu = (props: TagContextMenuProps) => {
  const manager = useTaskManager()
  const { deleteTags } = useTagHistory()
  const { hideAll } = useContextMenu()

  function clickBackdrop(e) {
    hideAll()
    eventStop(e)
  }

  function handleDelete() {
    deleteTags([props.tag])
  }

  function deleteDisabled() {
    return manager.tags.some((tag) => tag.name === props.tag.name)
  }

  return (
    <>
      {props.visible && (
        <div
          className="TagButton--backdrop"
          onClick={clickBackdrop}
          onContextMenu={eventStop}
          onDragStart={eventStop}
          onPointerDown={eventStop}
          data-name={props.tag.name}
        />
      )}
      <Menu id={props.id} onVisibilityChange={props.onVisibilityChange}>
        <Item id="delete" onClick={handleDelete} disabled={deleteDisabled}>
          <div className="context-menu__delete">
            <Icon className="context-menu__delete-icon" name="delete" />
            <span>{t('tag_delete_from_history')}</span>
          </div>
        </Item>
      </Menu>
    </>
  )
}
