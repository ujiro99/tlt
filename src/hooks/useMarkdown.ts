import { createElement } from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeReact from 'rehype-react'
import type { ComponentType } from 'react'
import type { Element } from 'hast'

import Log from '@/services/log'

interface WithNode {
  node: Element
}

type Components = Partial<{
  [TagName in keyof JSX.IntrinsicElements]:
    | keyof JSX.IntrinsicElements
    | ComponentType<WithNode & JSX.IntrinsicElements[TagName]>
}>

export function useMarkdown(text: string, components: Components): JSX.Element {
  Log.v('exec convertMarkdownToHtml')
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement: createElement,
      passNode: true,
      components: components,
    })
    .processSync(text).result
}
