type CodeToggleProps = {
  open: boolean
  onToggle: () => void
}

function CodeToggle({ open, onToggle }: CodeToggleProps) {
  return (
    <button
      type="button"
      className={
        open ? 'ui-button code-toggle code-toggle--active' : 'ui-button code-toggle'
      }
      aria-pressed={open}
      onClick={onToggle}
    >
      <span className="code-toggle__icon" aria-hidden="true">
        {'</>'}
      </span>
      {open ? 'Hide code' : 'View code'}
    </button>
  )
}

export default CodeToggle
