import api from './api'

export interface UploadResponse {
  url: string
  filename: string
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
