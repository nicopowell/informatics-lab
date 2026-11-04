import Markdown from "react-markdown"
import './markdown.css'

type MarkdownDescriptionProps = {
  source: string
}

function MarkdownDescription({ source }: MarkdownDescriptionProps) {
  return (
    <div className="experience-description">
      <Markdown>{source}</Markdown>
    </div>
  )
}

export default MarkdownDescription