import { z } from 'zod'

const metadataSchema = z.object({
  language: z.string().optional(),
  url: z.union([z.string().url({ message: 'Invalid URL' }), z.literal('')]).optional(),
  platform: z.string().optional(),
  excerpt: z.string().optional(),
})

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().default(''),
  type: z.enum(['note', 'article', 'snippet', 'bookmark', 'ai-rule'], {
    error: 'Invalid item type',
  }),
  tags: z.array(z.string().min(1)).optional().default([]),
  isPublic: z.boolean().optional().default(false),
  metadata: metadataSchema.optional(),
  attachments: z.array(z.string()).optional().default([]),
})

export const updateItemSchema = createItemSchema.partial()
