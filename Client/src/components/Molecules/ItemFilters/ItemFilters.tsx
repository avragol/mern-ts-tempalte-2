import { cn } from '@/lib/utils'
import type { ItemFilters, ItemType } from '@/types/itemsTypes'

const TYPE_TABS: { value: ItemType | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'note', label: 'Note' },
  { value: 'article', label: 'Article' },
  { value: 'snippet', label: 'Snippet' },
  { value: 'bookmark', label: 'Bookmark' },
  { value: 'ai-rule', label: 'AI Rule' },
]

export interface ItemFiltersProps {
  filters: ItemFilters
  onFiltersChange: (filters: ItemFilters) => void
  availableTags: string[]
  className?: string
}

export default function ItemFilters({
  filters,
  onFiltersChange,
  availableTags,
  className,
}: ItemFiltersProps) {
  const selectedTags = filters.tags ?? []

  const handleTypeChange = (type: ItemType | undefined) => {
    onFiltersChange({ ...filters, type, page: 1 })
  }

  const handleTagToggle = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    onFiltersChange({ ...filters, tags: next.length ? next : undefined, page: 1 })
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Type tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map(({ value, label }) => {
          const isActive = filters.type === value
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleTypeChange(value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Available tags */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200',
                  isSelected
                    ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
