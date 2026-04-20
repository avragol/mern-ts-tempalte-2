import { Router } from 'express'
import { asyncHandler } from '@/utils/errorHandler'
import { auth0Middleware } from '@/middleware/auth0Mdw'
import itemsController from '@/controllers/itemsControllers'

const router = Router()

router.post('/', auth0Middleware, asyncHandler(itemsController.createItem.bind(itemsController)))
router.get('/', auth0Middleware, asyncHandler(itemsController.getItems.bind(itemsController)))
router.get('/tags', auth0Middleware, asyncHandler(itemsController.getTags.bind(itemsController)))
router.get('/:id', auth0Middleware, asyncHandler(itemsController.getItemById.bind(itemsController)))
router.patch('/:id', auth0Middleware, asyncHandler(itemsController.updateItem.bind(itemsController)))
router.delete('/:id', auth0Middleware, asyncHandler(itemsController.deleteItem.bind(itemsController)))

export default router
