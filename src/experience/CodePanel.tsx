import { useState } from 'react'
import LanguageIcon from './LanguageIcon'
import HighlightedCode from './HighlightedCode'

export type ReferenceLanguage = {
  id: string
  label: string
  color: string
  code: string
}

type CodePanelProps = {
  languages: ReferenceLanguage[]
  open: boolean
}

function CodePanel({ languages, open }: CodePanelProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(languages[0].id)

  const reference =
    languages.find((entry) => entry.id === selectedId) ?? languages[0]

  return (
    <aside className={open ? 'code-panel code-panel--open' : 'code-panel'}>
      <div className="code-panel__header">
        <div className="code-panel__language">
          <button
            type="button"
            className="code-panel__language-trigger"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span
              className="code-panel__language-icon"
              style={{ color: reference.color }}
            >
              <LanguageIcon id={reference.id} />
            </span>
            {reference.label}
            <span
              className={
                menuOpen
                  ? 'code-panel__language-chevron code-panel__language-chevron--open'
                  : 'code-panel__language-chevron'
              }
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {menuOpen && (
            <ul className="code-panel__language-menu" role="listbox">
              {languages.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={entry.id === selectedId}
                    className={
                      entry.id === selectedId
                        ? 'code-panel__language-option code-panel__language-option--active'
                        : 'code-panel__language-option'
                    }
                    onClick={() => {
                      setSelectedId(entry.id)
                      setMenuOpen(false)
                    }}
                  >
                    <span
                      className="code-panel__language-icon"
                      style={{ color: entry.color }}
                    >
                      <LanguageIcon id={entry.id} />
                    </span>
                    {entry.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <pre className="code-panel__body">
        <HighlightedCode language={reference.id} code={reference.code} />
      </pre>
    </aside>
  )
}

export default CodePanel
