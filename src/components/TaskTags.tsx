import React from 'react'
import { Tag } from '@/models/tag'
import { TaskTag } from '@/components/TaskTag'
import { Icon } from '@/components/Icon'
import { Tooltip } from '@/components/Tooltip'
import { useHover } from '@/hooks/useHover'
import { tag2str } from '@/services/util'

import './TaskTags.css'

const TagCountMax = 2

type Props = {
  tags: Tag[]
}
export function TaskTags(props: Props): JSX.Element {
  const [hoverRef, isHovered] = useHover(200)
  const tags = props.tags.slice(0, TagCountMax)
  const isOmit = props.tags.length > TagCountMax

  const tooltip = props.tags.map((t) => tag2str(t)).join(', ')

  return (
    <div className="TaskTags">
      {tags.map((tag) => (
        <TaskTag key={tag.name} tag={tag} />
      ))}
      {isOmit && (
        <div className="TaskTags__more" ref={hoverRef as React.RefObject<HTMLDivElement>}>
          <Icon name="more-horiz" />
          <Tooltip
            show={isHovered}
            location={'top'}
            style={{ width: '8em', left: '-3.4em', bottom: '20px' }}
          >
            <span>{tooltip}</span>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
