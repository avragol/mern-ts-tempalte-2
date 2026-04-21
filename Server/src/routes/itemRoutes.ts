import { Router } from 'express'
import { asyncHandler } from '@/utils/errorHandler.js'
import { authMiddleware } from '@/middleware/authMdw.js'
import itemsController from '@/controllers/itemsControllers.js'

const router = Router()

router.post('/', authMiddleware, asyncHandler(itemsController.createItem.bind(itemsController)))
router.get('/', authMiddleware, asyncHandler(itemsController.getItems.bind(itemsController)))
router.get('/tags', authMiddleware, asyncHandler(itemsController.getTags.bind(itemsController)))
router.get('/:id', authMiddleware, asyncHandler(itemsController.getItemById.bind(itemsController)))
router.patch('/:id', authMiddleware, asyncHandler(itemsController.updateItem.bind(itemsController)))
router.delete('/:id', authMiddleware, asyncHandler(itemsController.deleteItem.bind(itemsController)))

export default router
