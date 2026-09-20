import { useState } from 'react'
import { EditPenIcon, TrashIcon, PlusIcon } from '../../components/icons'
import { PillButton, Modal, EmptyState } from './AdminUI'
import { initialCategories } from '../../services/adminMockData'

const SWATCHES = ['#C8102E', '#E8A33D', '#2E8B57', '#8C0B22', '#6B5D5A', '#9C8D8A', '#3A7CA5']

function CategoryForm({ initial, onCancel, onSave }) {
  const [name, setName] = useState(initial?.name || '')
  const [color, setColor] = useState(initial?.color || SWATCHES[0])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-nagorik-muted">Category name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Noise Complaints"
          className="w-full rounded-xl border border-nagorik-border bg-nagorik-surface-2 px-3.5 py-2.5 text-[13.5px] text-nagorik-body-text outline-none focus:border-nagorik-red"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-nagorik-muted">Color tag</label>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Choose ${c}`}
              className="h-7 w-7 shrink-0 cursor-pointer rounded-full"
              style={{
                backgroundColor: c,
                outline: color === c ? '2px solid var(--color-nagorik-heading)' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2.5 pt-2">
        <PillButton variant="ghost" onClick={onCancel}>
          Cancel
        </PillButton>
        <PillButton
          variant="solid"
          onClick={() => name.trim() && onSave({ name: name.trim(), color })}
        >
          {initial ? 'Save changes' : 'Add category'}
        </PillButton>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const addCategory = ({ name, color }) => {
    setCategories((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, name, color, issueCount: 0 },
    ])
    flash('Category added')
    setAdding(false)
  }

  const saveEdit = ({ name, color }) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === editing.id ? { ...c, name, color } : c)),
    )
    flash('Category updated')
    setEditing(null)
  }

  const confirmDelete = () => {
    setCategories((prev) => prev.filter((c) => c.id !== deleting.id))
    flash('Category deleted')
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="m-0 text-[13px] text-nagorik-muted">
          Categories help citizens tag and filter civic issues on the feed.
        </p>
        <PillButton variant="solid" onClick={() => setAdding(true)}>
          <PlusIcon />
          New category
        </PillButton>
      </div>

      {categories.length === 0 ? (
        <EmptyState text="No categories yet — add your first one." />
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-2 min-[1100px]:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-nagorik-line bg-nagorik-paper p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-xl"
                  style={{ backgroundColor: `${cat.color}22`, border: `2px solid ${cat.color}` }}
                />
                <div className="min-w-0">
                  <p className="m-0 truncate text-[13.5px] font-bold text-nagorik-heading">{cat.name}</p>
                  <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">{cat.issueCount} issues</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(cat)}
                  title="Edit category"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-nagorik-secondary hover:bg-nagorik-surface-2"
                >
                  <EditPenIcon />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting(cat)}
                  title="Delete category"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-nagorik-red hover:bg-nagorik-red/10"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <Modal title="New category" onClose={() => setAdding(false)}>
          <CategoryForm onCancel={() => setAdding(false)} onSave={addCategory} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <CategoryForm initial={editing} onCancel={() => setEditing(null)} onSave={saveEdit} />
        </Modal>
      )}

      {deleting && (
        <Modal
          title="Delete this category?"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <PillButton variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </PillButton>
              <PillButton variant="solid" onClick={confirmDelete}>
                Delete
              </PillButton>
            </>
          }
        >
          <p className="m-0">
            <strong>{deleting.name}</strong> will be removed. Existing issues keep their tag as text but
            it won't be selectable for new reports.
          </p>
        </Modal>
      )}
    </div>
  )
}
