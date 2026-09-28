import type { ReactNode } from 'react'

/*
 * Minimal Markdown renderer for experience descriptions. It only understands
 * the structure the descriptions actually use: a heading, paragraphs and a
 * list of `**Label:** value` items. Rendering it here keeps the styling in the
 * experience CSS instead of pulling in a Markdown dependency.
 */

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

type MarkdownDescriptionProps = {
  source: string
}

function MarkdownDescription({ source }: MarkdownDescriptionProps) {
  const blocks: ReactNode[] = []
  let paragraph: string[] = []
  let list: string[] = []

  function flushParagraph() {
    if (paragraph.length === 0) {
      return
    }
    const text = paragraph.join(' ')
    blocks.push(<p key={`p-${blocks.length}`}>{inline(text, `p-${blocks.length}`)}</p>)
    paragraph = []
  }

  function flushList() {
    if (list.length === 0) {
      return
    }
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item, index) => (
          <li key={index}>{inline(item, `li-${index}`)}</li>
        ))}
      </ul>,
    )
    list = []
  }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()

    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      blocks.push(
        <h1 key={`h-${blocks.length}`} className="experience-description__title">
          {line.slice(2)}
        </h1>,
      )
    } else if (line.startsWith('- ')) {
      flushParagraph()
      list.push(line.slice(2))
    } else if (line === '') {
      flushParagraph()
      flushList()
    } else {
      flushList()
      paragraph.push(line)
    }
  }

  flushParagraph()
  flushList()

  return <div className="experience-description">{blocks}</div>
}

export default MarkdownDescription
