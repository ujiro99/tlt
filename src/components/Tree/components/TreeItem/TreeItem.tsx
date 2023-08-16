import React, { forwardRef, HTMLAttributes } from 'react'
import classNames from 'classnames'

import { Remove } from '../'
import styles from './TreeItem.module.css'

export interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number
  clone?: boolean
  collapsed?: boolean
  depth: number
  disableInteraction?: boolean
  disableSelection?: boolean
  ghost?: boolean
  handleProps?: any
  indicator?: boolean
  indentationWidth: number
  value: string
  onCollapse?(): void
  onRemove?(): void
  wrapperRef?(node: HTMLLIElement): void
  dropTarget?: boolean
  dropTargetParent?: boolean
  dropTargetBottom?: boolean
}

export const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      dropTarget,
      dropTargetParent,
      dropTargetBottom,
      ...props
    },
    ref,
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
          collapsed && 'collapsed',
          ghost && 'ghost',
          clone && 'dragging',
          dropTarget && 'drop-target',
          dropTargetParent && 'drop-target-parent',
          dropTargetBottom && 'drop-target-bottom',
        )}
        ref={wrapperRef}
        style={
          {
            '--spacing': `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
        {...handleProps}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          {React.cloneElement(props.children as any, { onCollapse })}
          {!clone && onRemove && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    )
  },
)
