import type { Document, Model } from 'mongoose'

export type ItemType = 'note' | 'article' | 'snippet' | 'bookmark' | 'ai-rule'

export interface IItemMetadata {
  language?: string   // snippet: 'typescript', 'python', etc.
  url?: string        // bookmark: source URL
  platform?: string   // ai-rule: 'claude', 'cursor', 'chatgpt', etc.
  excerpt?: string    // article: short description
}

export interface IItem {
  title: string
  content: string
  type: ItemType
  tags: string[]
  createdBy: string   // userId (_id.toString())
  isPublic: boolean
  metadata?: IItemMetadata
  attachments: string[]
}

export interface IItemDoc extends IItem, Document {
  createdAt: Date
  updatedAt: Date
}

export interface IItemModel extends Model<IItemDoc> {
  findByCreator(userId: string): Promise<IItemDoc[]>
}
