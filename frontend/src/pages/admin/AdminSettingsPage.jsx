import { useEffect, useState } from 'react'
import { ShieldIcon, BellIconApp, AlertIcon } from '../../components/icons'

const DEFAULTS = {
  autoModeration: true,
  requireApproval: false,
  emailDigest: true,
  maintenanceMode: false,
}

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
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    if (!savedFlash) return
    const t = setTimeout(() => setSavedFlash(false), 1600)
    return () => clearTimeout(t)
  }, [savedFlash])

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    setSavedFlash(true)
  }

  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      {savedFlash && (
        <div className="fixed right-6 top-20 z-50 rounded-xl bg-nagorik-heading px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
          Settings saved
        </div>
      )}

      <div className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-5">
        <CardHead icon={<ShieldIcon />} title="Moderation" sub="Control how new reports enter the platform" />
        <Row
          label="Auto-moderation"
          sub="Automatically hide reports flagged by 3+ users pending review"
          active={settings.autoModeration}
          onToggle={() => toggle('autoModeration')}
        />
        <Row
          label="Require approval before publishing"
          sub="New issues stay hidden from the feed until an admin approves them"
          active={settings.requireApproval}
          onToggle={() => toggle('requireApproval')}
        />
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
