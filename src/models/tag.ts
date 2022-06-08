export type TagRecord = {
  name: string
  colorHex?: string
}

export type Tag = {
  quantity?: number
} & TagRecord

interface Tagged {
  tags: Tag[]
}

/**
 * Determine if the tag is retained.
 */
export function hasTags(arg: any): arg is Tagged {
  /* eslint @typescript-eslint/no-unsafe-member-access: 0 */
  return arg.tags !== undefined
}
