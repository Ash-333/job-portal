import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, Link, Type } from 'lucide-react'
import { sanitizeHtml } from '@/lib/sanitize'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
  disabled?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  height = '300px',
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      const clean = sanitizeHtml(editorRef.current.innerHTML)
      editorRef.current.innerHTML = clean
      onChange(clean)
    }
  }

  const execCommand = (command: string, value?: string) => {
    if (disabled) return
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    handleInput()
  }

  const insertLink = () => {
    if (disabled) return
    const url = window.prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  const formatBlock = (tag: string) => {
    execCommand('formatBlock', tag)
  }

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <div className="bg-muted/30 border-b border-border/60 p-2 flex items-center flex-wrap gap-1">
        <select
          onChange={(e) => formatBlock(e.target.value)}
          className="text-sm border border-border rounded-lg px-2 py-1.5 bg-background text-foreground"
          defaultValue=""
          disabled={disabled}
        >
          <option value="">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => execCommand('bold')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          disabled={disabled}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-40 text-destructive"
          title="Clear Formatting"
        >
          <Type className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className="p-4 focus:outline-none focus:ring-0 text-foreground rich-text-editor"
        style={{
          minHeight: disabled ? 'auto' : height,
          maxHeight: '500px',
          overflowY: 'auto',
          cursor: disabled ? 'not-allowed' : 'text',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor:empty:before {
            content: attr(data-placeholder);
            color: var(--color-muted-foreground);
            pointer-events: none;
          }
          .rich-text-editor a { color: var(--color-primary); text-decoration: underline; }
          .rich-text-editor ul, .rich-text-editor ol { padding-left: 1.5rem; }
          .rich-text-editor h1 { font-size: 1.5rem; font-weight: 700; }
          .rich-text-editor h2 { font-size: 1.25rem; font-weight: 600; }
          .rich-text-editor h3 { font-size: 1.125rem; font-weight: 600; }
        `
      }} />
    </div>
  )
}
