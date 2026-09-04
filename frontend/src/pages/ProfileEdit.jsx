import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const FIELD_DEFAULTS = {
  fullName: 'Arafath Akit',
  username: 'Sumur Akib',
  bio: 'Civic volunteer in Dhanmondi and Mohammadpur. Reporting what I see, one issue at a time.',
  email: 'akib_sumu@email.com',
  phone: '+880 1XXX-XXXXXX',
  homeArea: 'Bnasree, Dhaka',
}

const SETTING_DEFAULTS = {
  showContributions: true,
  showPhone: false,
}

export default function PostDetails() {
  useEffect(() => {
    document.title = 'Edit Profile — নাগরিক'
  }, [])

  const [formData, setFormData] = useState(FIELD_DEFAULTS)
  const [privacy, setPrivacy] = useState(SETTING_DEFAULTS)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const togglePrivacy = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const initials = formData.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="mx-auto max-w-[1160px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
      <Link
        to="/user"
        className="mb-[22px] flex w-fit items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to profile
      </Link>

      <div className="mx-0 my-0 grid max-w-none grid-cols-[1fr_320px] items-start gap-5 max-[1100px]:grid-cols-1">
        {/* LEFT COLUMN: Forms */}
        <div>
          <section className="mb-[22px] flex flex-col gap-5 rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[26px]">
            <h2 className="m-0 text-[18px] font-extrabold text-nagorik-heading">Edit profile</h2>

            <div className="flex items-center gap-[18px]">
              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-white text-[32px] font-extrabold text-nagorik-red shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] dark:bg-nagorik-surface-2">{initials || 'AB'}</div>
              <div className="flex flex-col gap-1.5">
                <button type="button" className="flex w-fit items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white">
                  Upload new photo
                </button>
                <p className="setting-desc m-0 text-[12px] text-nagorik-muted">JPG or PNG, at least 200x200px</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
              <div className="flex flex-col">
                <label htmlFor="fullName" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Full name</label>
                <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="username" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Username</label>
                <input id="username" type="text" name="username" value={formData.username} onChange={handleChange}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="bio" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Bio</label>
              <textarea id="bio" name="bio" rows="2" style={{ minHeight: '70px' }} value={formData.bio} onChange={handleChange}
                className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none resize-y leading-[1.6] transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="phone" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Phone number</label>
                <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="homeArea" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Home area</label>
              <input id="homeArea" type="text" name="homeArea" value={formData.homeArea} onChange={handleChange}
                className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white" />
            </div>
          </section>

          <section className="rounded-2xl border border-nagorik-border bg-nagorik-surface p-[18px_20px]">
            <h3 className="m-0 mb-1.5 text-[15px] font-extrabold text-nagorik-heading">Privacy</h3>
            <p className="setting-desc mb-2.5 text-[12px] text-nagorik-muted">Control what other residents can see on your public profile.</p>

            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Show my contributions publicly</span>
                <span className="text-[12px] text-nagorik-muted">Reported issues, upvotes and comments</span>
              </div>
              <button
                type="button"
                className={`toggle${privacy.showContributions ? ' active' : ''}`}
                onClick={() => togglePrivacy('showContributions')}
                aria-label="Show my contributions publicly"
              ></button>
            </div>

            <div className="flex items-center justify-between gap-3.5 border-b border-nagorik-border py-3 last:border-b-0">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-bold text-nagorik-body-text">Show phone number on profile</span>
                <span className="text-[12px] text-nagorik-muted">Only visible to verified ward officials</span>
              </div>
              <button
                type="button"
                className={`toggle${privacy.showPhone ? ' active' : ''}`}
                onClick={() => togglePrivacy('showPhone')}
                aria-label="Show phone number on profile"
              ></button>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Preview & Actions */}
        <aside className="flex flex-col gap-5 max-[1100px]:static min-[1100px]:sticky min-[1100px]:top-[90px]">
          <div className="flex flex-col rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[22px]">
            <h3 className="m-0 mb-1 text-[15px] font-extrabold text-nagorik-heading">Preview</h3>
            <div className="mt-1 flex items-center gap-3">
              <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-white text-[15px] font-extrabold text-nagorik-red shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] dark:bg-nagorik-surface-2">
                {initials || 'AB'}
              </div>
              <div>
                <p className="m-0 text-[15px] font-extrabold text-nagorik-heading">{formData.fullName || 'Name'}</p>
                <p className="mt-[2px] text-[12.5px] text-nagorik-muted">@{formData.username || 'username'}</p>
              </div>
            </div>
            <p className="mt-3.5 text-[13.5px] leading-[1.5] text-nagorik-secondary">
              {formData.bio || 'No bio provided.'}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-full bg-nagorik-red py-3 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red">Save changes</button>
            <Link to="/user" className="flex w-full items-center justify-center gap-[9px] rounded-full border-[1.5px] border-nagorik-border bg-white px-[26px] py-4 text-[13px] font-bold text-nagorik-secondary transition-[border-color_0.15s_ease,color_0.15s_ease] hover:border-nagorik-red hover:text-nagorik-red dark:bg-nagorik-surface">
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}