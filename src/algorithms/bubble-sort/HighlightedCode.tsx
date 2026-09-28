import type { ReactNode } from 'react'

/*
 * Minimal syntax highlighter for the reference snippets. It tokenizes each
 * language with a small ordered rule set and wraps tokens in <span> classes,
 * so the code panel reads like an editor without pulling in a highlighter
 * dependency. It is intentionally not a full parser; it only needs to look
 * right on the snippets it is given.
 */

type TokenType = 'comment' | 'string' | 'number' | 'keyword' | 'type' | 'operator' | 'plain'

type Rule = {
  type: TokenType
  pattern: RegExp
}

const COMMON_TYPES = ['int', 'bool', 'void', 'std', 'vector', 'string', 'number', 'float']

const LANGUAGES: Record<string, Rule[]> = {
  pseudocode: [
    { type: 'comment', pattern: /\/\/[^\n]*/ },
    { type: 'number', pattern: /\b\d+\b/ },
    {
      type: 'keyword',
      pattern:
        /\b(procedure|while|for|to|if|else|return|break|do|then|repeat|until|and|or|not|true|false|swap|length)\b/i,
    },
    { type: 'operator', pattern: /<-|->|[<>]=?|==|!=|[/+\-*]/ },
  ],
  python: [
    { type: 'comment', pattern: /#[^\n]*/ },
    { type: 'string', pattern: /'[^'\n]*'|"[^"\n]*"/ },
    {
      type: 'keyword',
      pattern:
        /\b(def|return|while|for|in|if|elif|else|break|continue|not|and|or|True|False|None|range|len)\b/,
    },
    { type: 'number', pattern: /\b\d+\b/ },
    { type: 'operator', pattern: /[-+*/<>=!]=?/ },
  ],
  javascript: [
    { type: 'comment', pattern: /\/\/[^\n]*/ },
    { type: 'string', pattern: /'[^'\n]*'|"[^"\n]*"|`[^`]*`/ },
    {
      type: 'keyword',
      pattern:
        /\b(function|return|let|const|var|while|for|if|else|break|continue|true|false|null|undefined)\b/,
    },
    { type: 'number', pattern: /\b\d+\b/ },
    { type: 'operator', pattern: /[-+*/<>=!?]{1,2}/ },
  ],
  cpp: [
    { type: 'comment', pattern: /\/\/[^\n]*/ },
    { type: 'string', pattern: /'[^'\n]*'|"[^"\n]*"/ },
    {
      type: 'keyword',
      pattern:
        /\b(void|return|while|for|if|else|break|continue|true|false|auto|const|struct|class|namespace|using)\b/,
    },
    { type: 'type', pattern: new RegExp(`\\b(${COMMON_TYPES.join('|')})\\b`) },
    { type: 'number', pattern: /\b\d+\b/ },
    { type: 'operator', pattern: /[-+*/<>=!&|]{1,2}/ },
  ],
}

function tokenPattern(rules: Rule[]): RegExp {
  const sources = rules.map((rule) => `(${rule.pattern.source})`)
  return new RegExp(sources.join('|'), 'g')
}

function highlightLine(line: string, rules: Rule[], keyPrefix: string): ReactNode[] {
  const pattern = tokenPattern(rules)
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index))
    }

    const groupIndex = match.slice(1).findIndex((group) => group !== undefined)
    const type = rules[groupIndex]?.type ?? 'plain'
    nodes.push(
      <span key={`${keyPrefix}-${match.index}`} className={`code-token code-token--${type}`}>
        {match[0]}
      </span>,
    )
    lastIndex = match.index + match[0].length

    if (match[0].length === 0) {
      pattern.lastIndex++
    }
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex))
  }

  return nodes
}

type HighlightedCodeProps = {
  language: string
  code: string
}

function HighlightedCode({ language, code }: HighlightedCodeProps) {
  const rules = LANGUAGES[language] ?? []

  return (
    <code>
      {code.split('\n').map((line, index, all) => (
        <span className="code-line" key={index}>
          {highlightLine(line, rules, `l${index}`)}
          {index < all.length - 1 ? '\n' : ''}
        </span>
      ))}
    </code>
  )
}

export default HighlightedCode
