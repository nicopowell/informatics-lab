import cppUrl from '../assets/language-icons/cpp.svg'
import javascriptUrl from '../assets/language-icons/javascript.svg'
import pythonUrl from '../assets/language-icons/python.svg'
import pseudocodeUrl from '../assets/language-icons/pseudocode.svg'

const LANGUAGE_ICONS: Record<string, string> = {
  pseudocode: pseudocodeUrl,
  python: pythonUrl,
  javascript: javascriptUrl,
  cpp: cppUrl
}

type LanguageIconProps = {
  id: string
}

function LanguageIcon({ id }: LanguageIconProps) {
  const src = LANGUAGE_ICONS[id]
  if (!src) return null
  return <img src={src} alt={`${id} icon`} />
}

export default LanguageIcon