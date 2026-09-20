import { PillButton } from './AdminUI'

export default function AdminPagination({ page, limit, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / limit))
  if (total <= limit) return null
  const from = (page - 1) * limit + 1
  const to = Math.min(total, page * limit)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-nagorik-muted">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <PillButton variant="ghost" onClick={() => onChange(page - 1)} className={page <= 1 ? 'pointer-events-none opacity-40' : ''}>
          Previous
        </PillButton>
        <span className="px-1 font-semibold text-nagorik-heading">
          {page} / {pages}
        </span>
        <PillButton variant="ghost" onClick={() => onChange(page + 1)} className={page >= pages ? 'pointer-events-none opacity-40' : ''}>
          Next
        </PillButton>
      </div>
    </div>
  )
}
