import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { ReactNode } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'rounded p-1.5 transition-colors duration-150',
        isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing…',
  className,
  readOnly = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className={cn('flex flex-col rounded-lg border border-gray-200 bg-white', className)}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-gray-200" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none px-4 py-3',
          'min-h-[200px] focus-within:outline-none',
          '[&_.tiptap]:min-h-[200px] [&_.tiptap]:outline-none',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left',
          '[&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
        )}
      />
    </div>
  )
}
