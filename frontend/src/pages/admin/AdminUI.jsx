import clsx from 'clsx'
import { XIcon } from '../../components/icons'
import SearchInput from '../../components/SearchInput'

// The search box is shared with the public feed, so it lives in components/;
// re-exported here to keep the admin pages importing it from one place.
export { SearchInput }

export function StatCard({ label, value, sub, icon: Icon, tone = 'red' }) {
  const toneClasses = {
    red: 'bg-nagorik-soft-red text-nagorik-red',
    gold: 'bg-nagorik-gold/15 text-nagorik-gold',
    green: 'bg-nagorik-green/15 text-nagorik-green',
    muted: 'bg-nagorik-surface-2 text-nagorik-secondary',
  }
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
      <div>
        <p className="m-0 text-[12px] font-semibold uppercase tracking-wide text-nagorik-muted">
          {label}
        </p>
        <p className="m-0 mt-2 text-[26px] font-extrabold text-nagorik-heading">{value}</p>
        {sub && <p className="m-0 mt-1 text-[12px] text-nagorik-muted">{sub}</p>}
      </div>
      {Icon && (
        <span
          className={clsx(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            toneClasses[tone],
          )}
        >
          <Icon size={18} />
        </span>
      )}
    </div>
  )
}

const STATUS_TONE = {
  Open: 'bg-nagorik-soft-red text-nagorik-red',
  'In progress': 'bg-nagorik-gold/15 text-nagorik-gold',
  Resolved: 'bg-nagorik-green/15 text-nagorik-green',
  Rejected: 'bg-nagorik-surface-2 text-nagorik-muted',
}

export function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold',
        STATUS_TONE[status] || STATUS_TONE.Open,
      )}
    >
      {status}
    </span>
  )
}

const PRIORITY_TONE = {
  High: 'text-nagorik-red',
  Medium: 'text-nagorik-gold',
  Low: 'text-nagorik-muted',
}

export function PriorityDot({ priority }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-[12px] font-semibold', PRIORITY_TONE[priority] || PRIORITY_TONE.Low)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {priority}
    </span>
  )
}

export function PillButton({ children, onClick, variant = 'outline', type = 'button', className }) {
  const variants = {
    // Every variant carries a 2px border (transparent when it has no outline)
    // so buttons of different variants are always exactly the same height.
    solid: 'border-transparent bg-nagorik-red text-white hover:bg-nagorik-hover-red',
    outline: 'border-nagorik-red text-nagorik-red hover:bg-nagorik-red hover:!text-white',
    ghost: 'border-transparent bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-line',
    danger: 'border-transparent bg-transparent text-nagorik-red hover:bg-nagorik-red/10',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={clsx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 px-4 py-2 text-[13px] font-bold transition-colors duration-150',
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[440px] rounded-2xl border border-nagorik-line bg-nagorik-paper p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="m-0 text-[16px] font-extrabold text-nagorik-heading">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-nagorik-secondary hover:bg-nagorik-surface-2 cursor-pointer"
          >
            <XIcon />
          </button>
        </div>
        <div className="text-[13.5px] text-nagorik-body-text">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2.5">{footer}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-nagorik-border py-14 text-center text-[13px] text-nagorik-muted">
      {text}
    </div>
  )
}