import React from 'react'
import classnames from 'classnames'

import { useEditable } from '@/hooks/useEditable'
import { useTaskManager } from '@/hooks/useTaskManager'
import { LineEditor } from '@/components/LineEditor'
import { TaskTag } from '@/components/Tag/TaskTag'
import { TagMenu } from '@/components/Tag/TagMenu'
import { Icon } from '@/components/Icon'
import { Node } from '@/models/node'
import { Group } from '@/models/group'
import { Tag } from '@/models/tag'
import { eventStop } from '@/services/util'
import Log from '@/services/log'

import './Heading.css'

const otherClass = {
  h1: 'text-base py-3',
  h2: 'text-base py-3',
  h3: 'text-sm py-2',
  h4: 'text-sm py-2',
  h5: 'text-sm py-2',
  h6: 'text-sm py-2',
}

type NodeProps = {
  node: Node
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export const MdHeading = (props: NodeProps): JSX.Element => {
  Log.v(props.node.data)
  const manager = useTaskManager()
  const line = props.node.line
  const group = props.node.data as Group
  const level = group.level
  const hasTags = group.tags.length > 0

  const [isEditing, focusOrEdit, edit] = useEditable(line)

  const TagName = (level <= 6 ? `h${level}` : `h6`) as HeadingTag

  const topMargin = () => {
    if (line === 0) return false
    return level <= 2
  }

  const onChangeTags = (tags: Tag[]) => {
    const newNode = props.node.clone()
    const group = newNode.data as Group
    group.tags = tags
    manager.setNodeByLine(newNode, line)
  }

  const addChild = (e: React.MouseEvent) => {
    const appendLine = manager.addEmptyChild(line)
    edit(appendLine)
    eventStop(e)
  }

  if (isEditing) {
    return (
      <LineEditor
        className={classnames(
          'Heading',
          `mod-${TagName}`,
          `mod-heading`,
          'bg-transparent',
          otherClass[TagName],
          {
            'mod-top-margin': topMargin(),
          },
        )}
        line={line}
      />
    )
  }

  return (
    <div
      className={classnames('Heading', `mod-${TagName}`, otherClass[TagName], {
        'mod-top-margin': topMargin(),
      })}
      onClick={focusOrEdit}
    >
      <TagName>{group.title}</TagName>

      {hasTags ? (
        <div className="flex items-center ml-2 font-medium">
          {group.tags.map((tag) => (
            <TaskTag key={tag.name} tag={tag} />
          ))}
        </div>
      ) : null}

      <div className="Heading__tagmenu">
        <TagMenu tags={group.tags} onChangeTags={onChangeTags} />
      </div>
      <div className="Heading__add-todo">
        <button className="Heading__add-button" onClick={addChild}>
          <Icon name="plus" />
        </button>
      </div>
    </div>
  )
}
