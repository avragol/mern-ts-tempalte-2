import { useState, useRef, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  className?: string
}

export default function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = 'Add tag…',
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s.toLowerCase()) &&
      inputValue.trim().length > 0,
  )

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2',
          'transition-colors duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100',
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-blue-200"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  addTag(suggestion)
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
