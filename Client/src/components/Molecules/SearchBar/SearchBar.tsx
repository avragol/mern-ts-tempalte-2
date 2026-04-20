import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync localValue when the controlled value changes from outside
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounce: fire onChange 400ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [localValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4',
          'text-sm text-gray-900 placeholder:text-gray-400',
          'outline-none transition-colors duration-200',
          'focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        )}
      />
    </div>
  )
}
