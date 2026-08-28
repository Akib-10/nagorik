import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { setPageStyles } from '../styles/usePageStyles'
import AppHeader from '../components/AppHeader'
import mapImg from '../assets/images/dhaka_map.png'
import { findReport, submitReport, updateReport } from '../services/issuesService'
import { HomeGlyph, PinIcon, ClockIcon, UploadCameraIcon } from '../components/icons'

const STEP_TITLES = {
  1: ['Report an Issue', 'Fill in the details below — our city team will review it shortly.'],
  2: ['Add Location & Photo', 'Drop a pin on the map and attach photos of the issue.'],
  3: ['Review & Submit', 'Double-check everything, then submit your report.'],
}

const DEFAULT_COORDS = 'Dhanmondi, Dhaka (23.81° N, 90.41° E)'

export default function ReportIssue() {
  useLayoutEffect(() => setPageStyles('app'))

  const navigate = useNavigate()
  // Edit mode: /report opened from the profile page with { editId } in
  // router state prefills the wizard and updates instead of creating.
  const location = useLocation()
  const editing = location.state?.editId ? findReport(location.state.editId) : null

  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 fields
  const [title, setTitle] = useState(() => editing?.title || '')
  const [category, setCategory] = useState(() => editing?.category || 'Roads & Infrastructure')
  const [priority, setPriority] = useState(() => editing?.priority || 'Medium')
  const [area, setArea] = useState(() => editing?.area || '')
  const [date, setDate] = useState(() => editing?.date || '')
  const [description, setDescription] = useState(() => editing?.description || '')

  // Step 2 state
  const [fullAddress, setFullAddress] = useState(() => editing?.address || '')
  const [slots, setSlots] = useState(() => {
    const photos = editing?.photos || []
    return [photos[0] || null, photos[1] || null, photos[2] || null]
  })
  const [pin, setPin] = useState({ left: '37%', top: '52%' })
  const [coordsText, setCoordsText] = useState(() => editing?.coordsText || DEFAULT_COORDS)
  const activeSlotRef = useRef(null)
  const photoInputRef = useRef(null)
  const mapWrapRef = useRef(null)

  useEffect(() => {
    document.title = 'Report an Issue — নাগরিক'
    document.documentElement.lang = 'en'
  }, [])

  const goStep = (n) => {
    setCurrentStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Step tabs: allow jumping to previous steps or exactly one forward
  const handleTabClick = (target) => {
    if (target < currentStep || target === currentStep + 1) goStep(target)
  }

  const handleDirClick = (dir) => {
    goStep(currentStep + dir)
  }

  // ---- photo uploads ------------------------------------------------------
  const openPicker = (index) => {
    if (slots[index]) return
    activeSlotRef.current = index
    photoInputRef.current.click()
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file || activeSlotRef.current === null) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const slotIndex = activeSlotRef.current
      setSlots((prev) => prev.map((s, i) => (i === slotIndex ? ev.target.result : s)))
      activeSlotRef.current = null
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const removePhoto = (e, index) => {
    e.stopPropagation()
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)))
  }

  // ---- map pin ------------------------------------------------------------
  const handleMapClick = (e) => {
    const wrap = mapWrapRef.current
    const r = wrap.getBoundingClientRect()
    const xPct = ((e.clientX - r.left) / r.width) * 100
    const yPct = ((e.clientY - r.top) / r.height) * 100
    setPin({ left: `${xPct}%`, top: `${yPct}%` })
    // rough geo estimate inside our Dhaka crop
    const lat = (23.90 - (yPct / 100) * 0.22).toFixed(4)
    const lng = (90.28 + (xPct / 100) * 0.30).toFixed(4)
    setCoordsText(`Dhaka (${lat}° N, ${lng}° E)`)
  }

  // Detect location (demo: center of map)
  const detectLocation = () => {
    setPin({ left: '50%', top: '50%' })
    setCoordsText('Dhaka (23.81° N, 90.41° E)')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {})
    }
  }

  // ---- review (step 3) ----------------------------------------------------
  const reviewRows = [
    ['Issue Title', title],
    ['Category', category],
    ['Priority', priority],
    ['Area / Landmark', area],
    ['Date Noticed', date],
    ['Description', description],
    ['Full Address', fullAddress],
  ]

  const chipClass = /high/i.test(priority) ? 'chip high' : (/low/i.test(priority) ? 'chip low' : 'chip')

  const filledPhotos = slots.filter(Boolean)

  const handleFinalSubmit = () => {
    const reportData = {
      title,
      category,
      priority,
      area,
      date,
      description,
      fullAddress,
      coordsText,
      photos: filledPhotos,
    }
    if (editing) {
      updateReport(editing.id, reportData)
      alert('Report updated!')
      navigate('/user')
    } else {
      submitReport(reportData)
      alert('Report submitted! Our team will review it soon.')
      navigate('/browse_feed')
    }
  }

  // Steps advance only after the browser-native validation of each step's
  // form passes (required fields), via form="..." on the Next buttons.
  const handleStep1Submit = (e) => {
    e.preventDefault()
    goStep(2)
  }

  const handleStep2Submit = (e) => {
    e.preventDefault()
    goStep(3)
  }

  return (
    <>
      <AppHeader
        logoHref="/browse_feed"
        navItems={[
          { label: 'HOME', to: '/browse_feed', icon: <HomeGlyph /> },
        ]}
        showIconButtons
      />

      {/* ================= REPORT WIZARD ================= */}
      <main className="container">

        <div className="page-head">
          <h1>{STEP_TITLES[currentStep][0]}</h1>
          <p>{STEP_TITLES[currentStep][1]}</p>
        </div>

        <div className="steps">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              className={`step-tab${currentStep === s ? ' active' : ''}${currentStep > s ? ' done' : ''}`}
              onClick={() => handleTabClick(s)}
            >
              <span className={`step-num${currentStep > s ? ' done' : ''}`}>{currentStep > s ? '✓' : s}</span>
              {['Issue Details', 'Add Location & Photo', 'Review & Submit'][s - 1]}
            </button>
          ))}
        </div>

        {/* ========== STEP 1 : ISSUE DETAILS ========== */}
        <section className={`step-panel${currentStep === 1 ? ' active' : ''}`}>
          <form className="form-card" id="report-step1" onSubmit={handleStep1Submit}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="issueTitle">Issue Title *</label>
                <input id="issueTitle" type="text" placeholder="e.g. Large pothole on Mirpur Road" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="issueCategory">Category *</label>
                <select id="issueCategory" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Roads &amp; Infrastructure</option>
                  <option>Water Logging</option>
                  <option>Waste Management</option>
                  <option>Street Lights</option>
                  <option>Public Safety</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="issuePriority">Priority Level</label>
                <select id="issuePriority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High / Emergency</option>
                </select>
              </div>
            </div>

            <div className="form-grid two">
              <div className="field">
                <label htmlFor="issueArea">Area / Landmark *</label>
                <input id="issueArea" type="text" placeholder="e.g. Mirpur 10, near Shadhinota Complex" required value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="issueDate">Date Noticed</label>
                <input id="issueDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="issueDesc">Description *</label>
              <textarea id="issueDesc" placeholder="Describe the problem in detail — what is wrong, since when, and how it affects people nearby..." required value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
            </div>
          </form>

          <div className="report-footer center">
            <button type="submit" form="report-step1" className="submit-big">Next</button>
          </div>
        </section>

        {/* ========== STEP 2 : LOCATION & PHOTOS ========== */}
        <section className={`step-panel${currentStep === 2 ? ' active' : ''}`}>
          {/* Remote form so the Next button can trigger native validation
              for the required address field without wrapping the panel. */}
          <form id="report-step2" onSubmit={handleStep2Submit} hidden></form>

          <div className="step2-grid">
            <div className="panel-box">
              <h3>Upload Photos</h3>
              <p className="sub">Add up to 3 photos — clear daylight photos help faster resolution.</p>
              <div className="upload-grid">
                {[0, 1].map((index) => (
                  <button type="button" key={index} className={`upload-slot${slots[index] ? ' filled' : ''}`} onClick={() => openPicker(index)}>
                    {slots[index] ? (
                      <>
                        <img src={slots[index]} alt="preview" />
                        <button type="button" className="remove-btn" onClick={(e) => removePhoto(e, index)}>×</button>
                      </>
                    ) : (
                      <>
                        <UploadCameraIcon />
                        <span>Add photo</span>
                      </>
                    )}
                  </button>
                ))}
                <button type="button" className={`upload-slot add-plus${slots[2] ? ' filled' : ''}`} onClick={() => openPicker(2)}>
                  {slots[2] ? (
                    <>
                      <img src={slots[2]} alt="preview" />
                      <button type="button" className="remove-btn" onClick={(e) => removePhoto(e, 2)}>×</button>
                    </>
                  ) : (
                    <span className="plus-sign">+</span>
                  )}
                </button>
              </div>
              <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoChange} />
            </div>

            <div className="panel-box">
              <h3>Location Address</h3>
              <p className="sub">Give the full address or detect it automatically.</p>
              <div className="field" style={{ marginBottom: '14px' }}>
                <label htmlFor="fullAddress">Full Address *</label>
                <textarea id="fullAddress" form="report-step2" required style={{ minHeight: '96px' }} placeholder="House / road / area, thana, city..." value={fullAddress} onChange={(e) => setFullAddress(e.target.value)}></textarea>
              </div>
              <button type="button" className="detect-btn" onClick={detectLocation}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Use My Current Location
              </button>
              <p className="loc-hint">
                <ClockIcon size={12} />
                {' '}Pinned: <b>{coordsText}</b>
              </p>
            </div>
          </div>

          <section className="map-card">
            <p className="map-label">Pin the exact spot — tap anywhere on the map</p>
            <div className="map-wrap" ref={mapWrapRef} onClick={handleMapClick}>
              <img src={mapImg} alt="Dhaka city map" />
              <svg className="map-pin" style={{ left: pin.left, top: pin.top }} width="34" height="44" viewBox="0 0 34 44">
                <path d="M17 1C8.7 1 2 7.7 2 16c0 10.5 15 27 15 27s15-16.5 15-27C32 7.7 25.3 1 17 1z" fill="#C8102E" />
                <circle cx="17" cy="16" r="6" fill="#fff" />
              </svg>
            </div>
          </section>

          <div className="report-footer split">
            <button type="button" className="back-btn" onClick={() => handleDirClick(-1)}>Back</button>
            <button type="submit" form="report-step2" className="submit-big">Next</button>
          </div>
        </section>

        {/* ========== STEP 3 : REVIEW ========== */}
        <section className={`step-panel${currentStep === 3 ? ' active' : ''}`}>

          <div className="review-card">
            <div className="review-head">
              <div>
                <h3>Report Summary</h3>
                <p className="sub">Please double-check everything before submitting.</p>
              </div>
              <span className={chipClass}>{priority}</span>
            </div>

            <div className="kv-rows">
              {reviewRows.map(([k, v]) => (
                <div className="kv-row" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v || '—'}</span>
                </div>
              ))}
            </div>

            <h4 className="rv-sub">Attached Photos</h4>
            <div className="review-photos">
              {filledPhotos.length ? (
                filledPhotos.map((src, i) => <img key={`${src.slice(-12)}-${i}`} src={src} alt="attached photo" />)
              ) : (
                <span className="none">No photos attached.</span>
              )}
            </div>

            <div className="review-loc">
              <PinIcon size={20} />
              <div>
                <b>Pinned Location</b>
                <span>{coordsText}</span>
              </div>
            </div>
          </div>

          <section className="map-card">
            <p className="map-label">Location preview</p>
            <div className="map-wrap">
              <img src={mapImg} alt="Dhaka city map" />
              <svg className="map-pin" style={{ left: pin.left, top: pin.top }} width="34" height="44" viewBox="0 0 34 44">
                <path d="M17 1C8.7 1 2 7.7 2 16c0 10.5 15 27 15 27s15-16.5 15-27C32 7.7 25.3 1 17 1z" fill="#C8102E" />
                <circle cx="17" cy="16" r="6" fill="#fff" />
              </svg>
            </div>
          </section>

          <div className="report-footer split">
            <button type="button" className="back-btn" onClick={() => handleDirClick(-1)}>Back</button>
            <button type="button" className="submit-big" onClick={handleFinalSubmit}>Submit</button>
          </div>
        </section>

      </main>
    </>
  )
}
