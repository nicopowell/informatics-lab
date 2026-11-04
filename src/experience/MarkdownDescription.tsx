import Markdown from "react-markdown"

type MarkdownDescriptionProps = {
  source: string
}

function MarkdownDescription({ source }: MarkdownDescriptionProps) {
  return (
    <Markdown>{source}</Markdown>
  )
}

export default MarkdownDescription