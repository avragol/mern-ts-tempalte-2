export type ItemType = 'note' | 'article' | 'snippet' | 'bookmark' | 'ai-rule'

export interface IItemMetadata {
  language?: string
  url?: string
  platform?: string
  excerpt?: string
}

export interface IItem {
  _id: string
  title: string
  content: string
  type: ItemType
  tags: string[]
  createdBy: string
  isPublic: boolean
  metadata?: IItemMetadata
  attachments: string[]
  createdAt: string
  updatedAt: string
}

export interface ItemFilters {
  type?: ItemType
  tags?: string[]
  search?: string
  page?: number
  limit?: number
}

export interface ItemsResponse {
  success: boolean
  data: IItem[]
  total: number
  page: number
  limit: number
}

export type CreateItemPayload = Omit<IItem, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>
export type UpdateItemPayload = Partial<CreateItemPayload>
