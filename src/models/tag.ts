export type TagRecord = {
  name: string
  colorHex?: string
}

export type Tag = {
  quantity?: number
} & TagRecord

