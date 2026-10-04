import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { SearchIcon } from './icons'

// Bolds the part of `text` the user has typed, when it sits at the start of a word.
function Highlight({ text, query }) {
  const q = query.trim().toLowerCase()
  if (!q) return text
  const lower = text.toLowerCase()
  let at = lower.startsWith(q) ? 0 : lower.indexOf(' ' + q)
  if (at > 0) at += 1
  if (at < 0) return text
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-extrabold text-nagorik-red">{text.slice(at, at + q.length)}</strong>
      {text.slice(at + q.length)}
    </>
  )
}

// suggestions (optional): [{ id, label, sub }] shown in a dropdown under the box.
// onPick(suggestion) fires when one is chosen (click or Enter).
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  suggestions = [],
  onPick,
  className = 'max-w-[320px]',
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const boxRef = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const showList = open && value.trim() !== '' && suggestions.length > 0

  const pick = (item) => {
    setOpen(false)
    setActive(-1)
    onPick?.(item)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      pick(suggestions[active])
    }
  }

  return (
    <div ref={boxRef} className={clsx('relative min-w-[200px] flex-1', className)}>
      <div className="flex items-center gap-2.5 rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-2.5 text-[13px] text-nagorik-muted">
        <SearchIcon size={15} />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent text-[13px] text-nagorik-body-text outline-none font-[inherit]"
        />
      </div>
      {showList && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 m-0 mt-2 list-none overflow-hidden rounded-2xl border border-nagorik-line bg-nagorik-paper p-1.5 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  'flex w-full cursor-pointer flex-col items-start rounded-xl border-0 px-3 py-2 text-left font-[inherit] transition-colors duration-100',
                  i === active ? 'bg-nagorik-surface-2' : 'bg-transparent',
                )}
              >
                <span className="w-full truncate text-[13px] font-semibold text-nagorik-heading">
                  <Highlight text={s.label} query={value} />
                </span>
                {s.sub && <span className="w-full truncate text-[11.5px] text-nagorik-muted">{s.sub}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}