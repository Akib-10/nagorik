import { useEffect, useRef, useState } from 'react'
import { EditPenIcon, TrashIcon, PlusIcon } from '../../components/icons'
import { PillButton, Modal, EmptyState } from './AdminUI'
import {
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from '../../services/adminServices'

const SWATCHES = ['#C8102E', '#E8A33D', '#2E8B57', '#8C0B22', '#6B5D5A', '#9C8D8A', '#3A7CA5']

function CategoryForm({ initial, onCancel, onSave, error, saving }) {
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
          maxLength={40}
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
      {error && <p className="m-0 text-[12.5px] font-semibold text-nagorik-red">{error}</p>}
      <div className="flex justify-end gap-2.5 pt-2">
        <PillButton variant="ghost" onClick={onCancel}>
          Cancel
        </PillButton>
        <PillButton
          variant="solid"
          onClick={() => !saving && name.trim() && onSave({ name: name.trim(), color })}
        >
          {saving ? 'Saving…' : initial ? 'Save changes' : 'Add category'}
        </PillButton>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState(null) // null = loading
  const [loadError, setLoadError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    let cancelled = false
    getAdminCategories()
      .then((list) => !cancelled && setCategories(list))
      .catch((e) => !cancelled && setLoadError(e.message || 'Request failed'))
    return () => {
      cancelled = true
      clearTimeout(toastTimer.current)
    }
  }, [])

  const closeForm = () => {
    setAdding(false)
    setEditing(null)
    setFormError('')
  }

  const addCategory = async ({ name, color }) => {
    setSaving(true)
    setFormError('')
    try {
      const created = await createAdminCategory({ name, color })
      setCategories((prev) => [...(prev || []), created])
      flash('Category added — it now appears in the report form')
      closeForm()
    } catch (e) {
      setFormError(e.message || 'Could not add the category')
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async ({ name, color }) => {
    setSaving(true)
    setFormError('')
    try {
      const updated = await updateAdminCategory(editing.id, { name, color })
      setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      flash('Category updated')
      closeForm()
    } catch (e) {
      setFormError(e.message || 'Could not update the category')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    const target = deleting
    setDeleting(null)
    try {
      await deleteAdminCategory(target.id)
      setCategories((prev) => prev.filter((c) => c.id !== target.id))
      flash('Category deleted')
    } catch (e) {
      flash(e.message || 'Could not delete the category')
    }
  }

  if (loadError) return <EmptyState text={`Couldn't load categories: ${loadError}`} />
  if (!categories) return <EmptyState text="Loading categories…" />

  return (
    <div className="flex flex-col gap-5">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="m-0 text-[13px] text-nagorik-muted">
          These are the options citizens see in the “Category” dropdown when reporting an issue.
        </p>
        <PillButton
          variant="solid"
          onClick={() => {
            setFormError('')
            setAdding(true)
          }}
        >
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
                  onClick={() => {
                    setFormError('')
                    setEditing(cat)
                  }}
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
        <Modal title="New category" onClose={closeForm}>
          <CategoryForm onCancel={closeForm} onSave={addCategory} error={formError} saving={saving} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit category" onClose={closeForm}>
          <CategoryForm
            initial={editing}
            onCancel={closeForm}
            onSave={saveEdit}
            error={formError}
            saving={saving}
          />
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
