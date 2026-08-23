import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import usePageStyles from '../hooks/usePageStyles'

const FIELD_DEFAULTS = {
  fullName: 'Abrar Bin Patwary',
  username: 'abrar.patwary',
  bio: 'Civic volunteer in Dhanmondi and Mohammadpur. Reporting what I see, one issue at a time.',
  email: 'abrar.patwary@email.com',
  phone: '+880 1XXX-XXXXXX',
  homeArea: 'Bnasree, Dhaka',
}

const SETTING_DEFAULTS = {
  showContributions: true,
  showPhone: false,
}

export default function ProfileEdit() {
  usePageStyles('app')

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
    <div className="profile-wrap">
      <Link
        to="/user"
        className="mini-pill ghost"
        style={{ width: 'fit-content', marginBottom: '22px' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to profile
      </Link>

      <div className="main-layout" style={{ padding: 0, maxWidth: 'none', margin: 0 }}>
        {/* LEFT COLUMN: Forms */}
        <div>
          <section className="form-card">
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--heading)' }}>Edit profile</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div className="avatar-lg">{initials || 'AB'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button type="button" className="mini-pill ghost" style={{ width: 'fit-content' }}>
                  Upload new photo
                </button>
                <p className="setting-desc" style={{ margin: 0 }}>JPG or PNG, at least 200x200px</p>
              </div>
            </div>

            <div className="form-grid two">
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input id="fullName" type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="username">Username</label>
                <input id="username" type="text" name="username" value={formData.username} onChange={handleChange} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" name="bio" rows="2" style={{ minHeight: '70px' }} value={formData.bio} onChange={handleChange} />
            </div>

            <div className="form-grid two">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone number</label>
                <input id="phone" type="text" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="homeArea">Home area</label>
              <input id="homeArea" type="text" name="homeArea" value={formData.homeArea} onChange={handleChange} />
            </div>
          </section>

          <section className="setting-card" style={{ marginTop: '22px' }}>
            <h3>Privacy</h3>
            <p className="setting-desc" style={{ marginBottom: '10px' }}>Control what other residents can see on your public profile.</p>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Show my contributions publicly</span>
                <span className="setting-desc">Reported issues, upvotes and comments</span>
              </div>
              <button
                type="button"
                className={`toggle${privacy.showContributions ? ' active' : ''}`}
                onClick={() => togglePrivacy('showContributions')}
                aria-label="Show my contributions publicly"
              ></button>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Show phone number on profile</span>
                <span className="setting-desc">Only visible to verified ward officials</span>
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
        <aside className="sidebar">
          <div className="panel-box">
            <h3>Preview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <div className="avatar-lg" style={{ width: '44px', height: '44px', fontSize: '15px', outlineWidth: '2px' }}>
                {initials || 'AB'}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--heading)' }}>{formData.fullName || 'Name'}</p>
                <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>@{formData.username || 'username'}</p>
              </div>
            </div>
            <p style={{ marginTop: '14px', fontSize: '13.5px', lineHeight: 1.5, color: 'var(--secondary)' }}>
              {formData.bio || 'No bio provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button type="button" className="cta-btn">Save changes</button>
            <Link to="/user" className="loc-btn" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}