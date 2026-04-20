import type { ComponentType, SVGProps } from 'react'
import { FileText, BookOpen, Code2, Bookmark, Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import Card from '@/components/Atoms/Card/Card'
import { Badge } from '@/components/Atoms'
import type { IItem, ItemType } from '@/types/itemsTypes'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const TYPE_CONFIG: Record<
  ItemType,
  { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; color: string }
> = {
  note: { icon: FileText, label: 'Note', color: 'text-yellow-600' },
  article: { icon: BookOpen, label: 'Article', color: 'text-blue-600' },
  snippet: { icon: Code2, label: 'Snippet', color: 'text-green-600' },
  bookmark: { icon: Bookmark, label: 'Bookmark', color: 'text-purple-600' },
  'ai-rule': { icon: Bot, label: 'AI Rule', color: 'text-orange-600' },
}

export interface ItemCardProps {
  item: IItem
  className?: string
}

export default function ItemCard({ item, className }: ItemCardProps) {
  const navigate = useNavigate()
  const { icon: Icon, label, color } = TYPE_CONFIG[item.type]
  const contentPreview =
    item.content.length > 100 ? item.content.slice(0, 100) + '…' : item.content

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/items/${item._id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/items/${item._id}`)}
      className={cn('cursor-pointer', className)}
    >
    <Card variant="outlined" hover={true}>
      <div className="flex flex-col gap-3">
        {/* Header: type icon + label + date */}
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-1.5 text-sm font-medium', color)}>
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
          {item.title}
        </h3>

        {/* Content preview */}
        {contentPreview && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{contentPreview}</p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
    </div>
  )
}
