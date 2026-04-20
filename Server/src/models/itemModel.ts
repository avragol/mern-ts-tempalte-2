import mongoose, { Schema } from 'mongoose'
import type { IItemDoc, IItemModel } from '@/types'

const itemSchema = new Schema<IItemDoc>({
  title: { type: String, required: true },
  content: { type: String, required: false, default: '' },
  type: {
    type: String,
    enum: ['note', 'article', 'snippet', 'bookmark', 'ai-rule'],
    required: true,
  },
  tags: { type: [String], default: [] },
  createdBy: { type: String, required: true }, // auth0Id
  isPublic: { type: Boolean, default: false },
  metadata: {
    language: { type: String },
    url: { type: String },
    platform: { type: String },
    excerpt: { type: String },
  },
  attachments: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// Full-text search index
itemSchema.index({ title: 'text', content: 'text', tags: 'text' })

// Compound index for efficient per-user queries
itemSchema.index({ createdBy: 1, type: 1 })

itemSchema.statics.findByCreator = async function(auth0Id: string) {
  return this.find({ createdBy: auth0Id })
}

const ItemModel = mongoose.model<IItemDoc, IItemModel>('Item', itemSchema)
export default ItemModel
