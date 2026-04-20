import type { Request, Response } from 'express'
import Item from '@/models/itemModel'
import { createItemSchema, updateItemSchema } from '@/zod/itemsZod'
import { AppError } from '@/utils/errorHandler'

class ItemsController {
  async createItem(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const data = createItemSchema.parse(req.body)
    const item = await Item.create({ ...data, createdBy: auth0Id })
    res.status(201).json({ success: true, data: item })
  }

  async getItems(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const { type, tags, search, page = '1', limit = '20' } = req.query as Record<string, string>

    const query: Record<string, unknown> = {}

    // Show user's own items + public items from others
    query['$or'] = [{ createdBy: auth0Id }, { isPublic: true }]

    if (type) query['type'] = type
    if (tags) query['tags'] = { $in: tags.split(',').map(t => t.trim()) }
    if (search) query['$text'] = { $search: search }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const [items, total] = await Promise.all([
      Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Item.countDocuments(query),
    ])

    res.status(200).json({ success: true, data: items, total, page: pageNum, limit: limitNum })
  }

  async getItemById(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const { id } = req.params
    const item = await Item.findById(id)
    if (!item) throw new AppError('Item not found', 404)

    if (item.createdBy !== auth0Id && !item.isPublic) {
      throw new AppError('Access denied', 403)
    }

    res.status(200).json({ success: true, data: item })
  }

  async updateItem(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const { id } = req.params
    const item = await Item.findById(id)
    if (!item) throw new AppError('Item not found', 404)
    if (item.createdBy !== auth0Id) throw new AppError('Access denied', 403)

    const data = updateItemSchema.parse(req.body)
    if (Object.keys(data).length === 0) throw new AppError('At least one field must be provided', 400)

    const updated = await Item.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    res.status(200).json({ success: true, data: updated })
  }

  async deleteItem(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const { id } = req.params
    const item = await Item.findById(id)
    if (!item) throw new AppError('Item not found', 404)
    if (item.createdBy !== auth0Id) throw new AppError('Access denied', 403)

    await Item.findByIdAndDelete(id)
    res.status(200).json({ success: true, message: 'Item deleted successfully' })
  }

  async getTags(req: Request, res: Response) {
    const auth0Id = req.auth?.payload?.sub
    if (!auth0Id) throw new AppError('Unauthorized', 401)

    const tags = await Item.distinct('tags', {
      $or: [{ createdBy: auth0Id }, { isPublic: true }],
    })
    res.status(200).json({ success: true, data: tags.filter(Boolean).sort() })
  }
}

export default new ItemsController()
