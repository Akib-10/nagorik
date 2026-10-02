import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { ShieldIcon, BellIconApp, AlertIcon } from '../../components/icons'
import { getAdminSettings, updateAdminSettings } from '../../services/adminServices'

// Local-only switches (not stored on the server yet).
const DEFAULTS = {
  autoModeration: true,
  emailDigest: true,
  maintenanceMode: false,
}

// Server-backed: what happens to a NEW report.
const APPROVAL_OPTIONS = [
  {
    value: 'all',
    label: 'All',
    hint: 'Every new report is approved automatically and goes live straight away.',
  },
  {
    value: 'manual',
    label: 'Manual',
    hint: 'New reports wait as Pending until an admin approves them in Manage Issues.',
  },
]

function CardHead({ icon, title, sub }) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-nagorik-soft-red text-nagorik-red">
        {icon}
      </span>
      <div>
        <h3 className="m-0 text-[15px] font-extrabold text-nagorik-heading">{title}</h3>
        {sub && <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">{sub}</p>}
      </div>
    </div>
  )
}

function Row({ label, sub, active, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-nagorik-line py-3.5 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="m-0 text-[13.5px] font-semibold text-nagorik-heading">{label}</p>
        {sub && <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={active}
        className={`toggle${active ? ' active' : ''}`}
      />
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [approvalMode, setApprovalMode] = useState(null) // null = still loading
  const [approvalError, setApprovalError] = useState('')
  const [savingApproval, setSavingApproval] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelled = false
    getAdminSettings()
      .then((s) => !cancelled && setApprovalMode(s.approvalMode || 'manual'))
      .catch((e) => {
        if (cancelled) return
        setApprovalMode('manual')
        setApprovalError(e.message || "Couldn't load the approval setting")
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1600)
    return () => clearTimeout(t)
  }, [toast])

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    setToast('Settings saved')
  }

  const chooseApproval = async (value) => {
    if (value === approvalMode || savingApproval) return
    const previous = approvalMode
    setApprovalMode(value) // optimistic
    setApprovalError('')
    setSavingApproval(true)
    try {
      await updateAdminSettings({ approvalMode: value })
      setToast('Settings saved')
    } catch (e) {
      setApprovalMode(previous)
      setApprovalError(e.message || 'Could not save the approval setting')
    } finally {
      setSavingApproval(false)
    }
  }

  const activeOption = APPROVAL_OPTIONS.find((o) => o.value === approvalMode)

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      {toast && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <CardHead icon={<ShieldIcon />} title="Moderation" sub="Control how new reports enter the platform" />

        <div className="flex flex-col gap-3 border-b border-nagorik-line pb-4">
          <div className="min-w-0">
            <p className="m-0 text-[13.5px] font-semibold text-nagorik-heading">Approve posts</p>
            <p className="m-0 mt-0.5 text-[11.5px] text-nagorik-muted">
              Choose whether new reports are approved automatically or reviewed by an admin first.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Approve posts"
            className={clsx(
              'inline-flex w-full max-w-[320px] rounded-full bg-nagorik-surface-2 p-1',
              approvalMode === null && 'opacity-60',
            )}
          >
            {APPROVAL_OPTIONS.map((o) => {
              const selected = approvalMode === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={approvalMode === null || savingApproval}
                  onClick={() => chooseApproval(o.value)}
                  className={clsx(
                    'flex-1 cursor-pointer rounded-full px-4 py-2 text-[13px] font-bold transition-colors duration-150 disabled:cursor-default',
                    selected
                      ? 'bg-nagorik-red text-white shadow-sm'
                      : 'text-nagorik-secondary hover:text-nagorik-heading',
                  )}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          {activeOption && (
            <p className="m-0 text-[12px] text-nagorik-secondary">{activeOption.hint}</p>
          )}
          {approvalError && (
            <p className="m-0 text-[12px] font-semibold text-nagorik-red">{approvalError}</p>
          )}
        </div>

        <div className="pt-4">
          <Row
            label="Auto-moderation"
            sub="Automatically hide reports flagged by 3+ users pending review"
            active={settings.autoModeration}
            onToggle={() => toggle('autoModeration')}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <CardHead icon={<BellIconApp />} title="Notifications" sub="Choose what the admin team gets notified about" />
        <Row
          label="Weekly email digest"
          sub="Summary of new reports, flags and resolved issues"
          active={settings.emailDigest}
          onToggle={() => toggle('emailDigest')}
        />
      </div>

      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <CardHead icon={<AlertIcon />} title="Danger zone" sub="Affects every visitor on the platform" />
        <Row
          label="Maintenance mode"
          sub="Show a maintenance banner and disable new report submissions"
          active={settings.maintenanceMode}
          onToggle={() => toggle('maintenanceMode')}
        />
      </div>
    </div>
  )
}
