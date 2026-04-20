import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { Upload, X, FileIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadFile } from '@/services/upload'

export interface FileUploadProps {
  onUpload: (url: string) => void
  accept?: string
  className?: string
  label?: string
}

interface PreviewFile {
  name: string
  url: string
  isImage: boolean
}

export default function FileUpload({
  onUpload,
  accept,
  className,
  label = 'Drag & drop a file here, or click to select',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<PreviewFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isImageFile = (file: File) => file.type.startsWith('image/')

  const handleFile = async (file: File) => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await uploadFile(file)
      setPreview({
        name: response.filename,
        url: response.url,
        isImage: isImageFile(file),
      })
      onUpload(response.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input so the same file can be re-uploaded
    e.target.value = ''
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8',
          'transition-colors duration-200',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50',
          !isLoading && 'cursor-pointer hover:border-blue-400 hover:bg-blue-50',
          isLoading && 'cursor-not-allowed opacity-70',
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-500">Uploading…</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="text-center text-sm text-gray-500">{label}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Preview */}
      {preview && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
          {preview.isImage ? (
            <img
              src={preview.url}
              alt={preview.name}
              className="h-12 w-12 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100">
              <FileIcon className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <span className="flex-1 truncate text-sm text-gray-700">{preview.name}</span>
          <button
            type="button"
            onClick={clearPreview}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
