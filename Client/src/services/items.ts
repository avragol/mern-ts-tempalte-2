import api from './api'
import type { ItemFilters, CreateItemPayload, UpdateItemPayload, IItem, ItemsResponse } from '@/types/itemsTypes'

export const getItems = async (filters: ItemFilters = {}): Promise<ItemsResponse> => {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.tags?.length) params.set('tags', filters.tags.join(','))
  if (filters.search) params.set('search', filters.search)
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))
  const { data } = await api.get(`/items?${params.toString()}`)
  return data
}

export const getItemById = async (id: string): Promise<IItem> => {
  const { data } = await api.get(`/items/${id}`)
  return data.data
}

export const createItem = async (payload: CreateItemPayload): Promise<IItem> => {
  const { data } = await api.post('/items', payload)
  return data.data
}

export const updateItem = async (id: string, payload: UpdateItemPayload): Promise<IItem> => {
  const { data } = await api.patch(`/items/${id}`, payload)
  return data.data
}

export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`)
}

export const getTags = async (): Promise<string[]> => {
  const { data } = await api.get('/items/tags')
  return data.data
}
