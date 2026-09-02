import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const location = useLocation()
  const editing = location.state?.editId ? findReport(location.state.editId) : null

  const [currentStep, setCurrentStep] = useState(1)

  const [title, setTitle] = useState(() => editing?.title || '')
  const [category, setCategory] = useState(() => editing?.category || 'Roads & Infrastructure')
  const [priority, setPriority] = useState(() => editing?.priority || 'Medium')
  const [area, setArea] = useState(() => editing?.area || '')
  const [date, setDate] = useState(() => editing?.date || '')
  const [description, setDescription] = useState(() => editing?.description || '')

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

  const handleTabClick = (target) => {
    if (target < currentStep || target === currentStep + 1) goStep(target)
  }

  const handleDirClick = (dir) => {
    goStep(currentStep + dir)
  }

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

  const handleMapClick = (e) => {
    const wrap = mapWrapRef.current
    const r = wrap.getBoundingClientRect()
    const xPct = ((e.clientX - r.left) / r.width) * 100
    const yPct = ((e.clientY - r.top) / r.height) * 100
    setPin({ left: `${xPct}%`, top: `${yPct}%` })
    const lat = (23.90 - (yPct / 100) * 0.22).toFixed(4)
    const lng = (90.28 + (xPct / 100) * 0.30).toFixed(4)
    setCoordsText(`Dhaka (${lat}° N, ${lng}° E)`)
  }

  const detectLocation = () => {
    setPin({ left: '50%', top: '50%' })
    setCoordsText('Dhaka (23.81° N, 90.41° E)')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(() => {}, () => {})
    }
  }

  const reviewRows = [
    ['Issue Title', title],
    ['Category', category],
    ['Priority', priority],
    ['Area / Landmark', area],
    ['Date Noticed', date],
    ['Description', description],
    ['Full Address', fullAddress],
  ]

  const chipClass = /high/i.test(priority) ? 'bg-nagorik-red text-white' : (/low/i.test(priority) ? 'bg-[#E8F5EE] text-nagorik-green' : '')

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

      <main className="mx-auto max-w-[1160px] px-7 max-[760px]:px-4">

        <div className="py-[36px_0_28px] text-center">
          <h1 className="mb-2 m-0 text-[30px] font-extrabold text-nagorik-heading">{STEP_TITLES[currentStep][0]}</h1>
          <p className="m-0 text-[14px] text-nagorik-secondary">{STEP_TITLES[currentStep][1]}</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3.5">
          {[1, 2, 3].map((s) => {
            const isActive = currentStep === s
            const isDone = currentStep > s
            return (
              <button
                key={s}
                type="button"
                className={`flex flex-1 items-center justify-center gap-2.5 rounded-[14px] px-[26px] py-[17px] text-[13px] font-bold transition-colors duration-150 max-[760px]:flex-[1_1_100%] ${isActive ? 'bg-nagorik-red text-white' : isDone ? 'border-[1.5px] border-nagorik-light-red bg-white text-nagorik-red' : 'bg-nagorik-soft-red text-nagorik-muted'}`}
                onClick={() => handleTabClick(s)}
              >
                <span className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${isActive ? 'bg-white text-nagorik-red' : isDone ? 'bg-nagorik-red text-white' : 'bg-white text-nagorik-red'}`}>{isDone ? '✓' : s}</span>
                {['Issue Details', 'Add Location & Photo', 'Review & Submit'][s - 1]}
              </button>
            )
          })}
        </div>

        {/* ========== STEP 1 : ISSUE DETAILS ========== */}
        <section className={currentStep === 1 ? 'block' : 'hidden'}>
          <form className="mb-[22px] flex flex-col gap-5 rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[26px]" id="report-step1" onSubmit={handleStep1Submit}>
            <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
              <div className="flex flex-col">
                <label htmlFor="issueTitle" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Issue Title *</label>
                <input id="issueTitle" type="text" placeholder="e.g. Large pothole on Mirpur Road" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="issueCategory" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Category *</label>
                <select id="issueCategory" value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white cursor-pointer">
                  <option>Roads &amp; Infrastructure</option>
                  <option>Water Logging</option>
                  <option>Waste Management</option>
                  <option>Street Lights</option>
                  <option>Public Safety</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="issuePriority" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Priority Level</label>
                <select id="issuePriority" value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white cursor-pointer">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High / Emergency</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[18px] max-[900px]:grid-cols-1">
              <div className="flex flex-col">
                <label htmlFor="issueArea" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Area / Landmark *</label>
                <input id="issueArea" type="text" placeholder="e.g. Mirpur 10, near Shadhinota Complex" required value={area} onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted" />
              </div>
              <div className="flex flex-col">
                <label htmlFor="issueDate" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Date Noticed</label>
                <input id="issueDate" type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white cursor-pointer" />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="issueDesc" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Description *</label>
              <textarea id="issueDesc" placeholder="Describe the problem in detail — what is wrong, since when, and how it affects people nearby..." required value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[150px] rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none resize-y leading-[1.6] transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"></textarea>
            </div>
          </form>

          <div className="flex justify-center pb-10">
            <button type="submit" form="report-step1" className="rounded-full bg-nagorik-red px-[64px] py-[18px] text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red max-[900px]:w-full">Next</button>
          </div>
        </section>

        {/* ========== STEP 2 : LOCATION & PHOTOS ========== */}
        <section className={currentStep === 2 ? 'block' : 'hidden'}>
          <form id="report-step2" onSubmit={handleStep2Submit} hidden></form>

          <div className="mb-[22px] grid grid-cols-2 gap-[22px] max-[900px]:grid-cols-1">
            <div className="flex flex-col rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[22px]">
              <h3 className="m-0 mb-1 text-[15px] font-extrabold text-nagorik-heading">Upload Photos</h3>
              <p className="sub m-0 mb-4 text-[12px] text-nagorik-muted">Add up to 3 photos — clear daylight photos help faster resolution.</p>
              <div className="mt-4 grid flex-1 grid-cols-3 gap-3">
                {[0, 1].map((index) => (
                  <button type="button" key={index} className={`relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border-2 border-dashed ${slots[index] ? 'border-nagorik-light-red bg-nagorik-soft-red' : 'border-nagorik-light-red bg-nagorik-soft-red'} p-2.5 text-[11.5px] font-semibold text-nagorik-muted font-[inherit] transition-colors duration-150 hover:border-nagorik-red`} onClick={() => openPicker(index)}>
                    {slots[index] ? (
                      <>
                        <img src={slots[index]} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
                        <button type="button" className="absolute right-2 top-2 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-nagorik-red/92 text-[14px] leading-none text-white cursor-pointer" onClick={(e) => removePhoto(e, index)}>×</button>
                      </>
                    ) : (
                      <>
                        <UploadCameraIcon />
                        <span>Add photo</span>
                      </>
                    )}
                  </button>
                ))}
                <button type="button" className="relative flex min-h-[170px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border-2 border-dashed border-nagorik-light-red bg-nagorik-soft-red p-2.5 text-[11.5px] font-semibold text-nagorik-muted font-[inherit] transition-colors duration-150 hover:border-nagorik-red" onClick={() => openPicker(2)}>
                  {slots[2] ? (
                    <>
                      <img src={slots[2]} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
                      <button type="button" className="absolute right-2 top-2 z-[2] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-nagorik-red/92 text-[14px] leading-none text-white cursor-pointer" onClick={(e) => removePhoto(e, 2)}>×</button>
                    </>
                  ) : (
                    <span className="text-[40px] font-extralight leading-none text-nagorik-red">+</span>
                  )}
                </button>
              </div>
              <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoChange} />
            </div>

            <div className="flex flex-col rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[22px]">
              <h3 className="m-0 mb-1 text-[15px] font-extrabold text-nagorik-heading">Location Address</h3>
              <p className="sub m-0 mb-4 text-[12px] text-nagorik-muted">Give the full address or detect it automatically.</p>
              <div className="flex flex-col mb-3.5">
                <label htmlFor="fullAddress" className="mb-2 block text-[12.5px] font-bold text-nagorik-heading">Full Address *</label>
                <textarea id="fullAddress" form="report-step2" required style={{ minHeight: '96px' }} placeholder="House / road / area, thana, city..." value={fullAddress} onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full min-h-[150px] rounded-[10px] border-[1.5px] border-transparent bg-nagorik-cream px-3.5 py-[13px] text-[13.5px] text-nagorik-heading font-[inherit] outline-none resize-y leading-[1.6] transition-[border-color_0.15s_ease,background_0.15s_ease] focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"></textarea>
              </div>
              <button type="button" className="flex w-fit items-center gap-2 rounded-full bg-nagorik-red px-5 py-[11px] text-[12.5px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red font-[inherit] max-[900px]:w-full max-[900px]:justify-center" onClick={detectLocation}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                Use My Current Location
              </button>
              <p className="mt-auto flex items-center gap-1.5 pt-3.5 text-[11.5px] text-nagorik-muted">
                <ClockIcon size={12} />
                {' '}Pinned: <b className="font-bold text-nagorik-secondary">{coordsText}</b>
              </p>
            </div>
          </div>

          <section className="mb-[22px] rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[18px]">
              <p className="m-0 mb-2.5 ml-1 text-[12.5px] font-bold text-nagorik-heading">Pin the exact spot — tap anywhere on the map</p>
              <div className="relative cursor-crosshair overflow-hidden rounded-xl" ref={mapWrapRef} onClick={handleMapClick}>
                <img src={mapImg} alt="Dhaka city map" className="h-[430px] w-full object-cover" />
                <svg className="map-pin" style={{ left: pin.left, top: pin.top }} width="34" height="44" viewBox="0 0 34 44">
                  <path d="M17 1C8.7 1 2 7.7 2 16c0 10.5 15 27 15 27s15-16.5 15-27C32 7.7 25.3 1 17 1z" fill="#C8102E" />
                  <circle cx="17" cy="16" r="6" fill="#fff" />
                </svg>
              </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-10">
            <button type="button" className="inline-flex items-center justify-center gap-[9px] rounded-full border-[1.5px] border-nagorik-border bg-white px-[56px] py-[17px] text-[15px] font-bold text-nagorik-secondary transition-[border-color_0.15s_ease,color_0.15s_ease] hover:border-nagorik-red hover:text-nagorik-red dark:bg-nagorik-surface" onClick={() => handleDirClick(-1)}>Back</button>
            <button type="submit" form="report-step2" className="rounded-full bg-nagorik-red px-[64px] py-[18px] text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red max-[900px]:w-full max-[900px]:justify-center">Next</button>
          </div>
        </section>

        {/* ========== STEP 3 : REVIEW ========== */}
        <section className={currentStep === 3 ? 'block' : 'hidden'}>

          <div className="mb-[22px] rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[26px]">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="m-0 mb-1 text-[16px] font-extrabold text-nagorik-heading">Report Summary</h3>
                <p className="sub m-0 text-[12px] text-nagorik-muted">Please double-check everything before submitting.</p>
              </div>
              <span className={`whitespace-nowrap rounded-full px-[18px] py-2 text-[12px] font-extrabold ${chipClass || 'bg-nagorik-soft-red text-nagorik-red'}`}>{priority}</span>
            </div>

            <div>
              {reviewRows.map(([k, v]) => (
                <div className="flex gap-[24px] border-b border-nagorik-cream py-[13px] text-[13.5px]" key={k}>
                  <span className="w-[190px] shrink-0 text-nagorik-muted font-semibold">{k}</span>
                  <span className="break-words text-nagorik-heading font-bold text-right">{v || '—'}</span>
                </div>
              ))}
            </div>

            <h4 className="mt-5 mb-3 text-[13px] font-extrabold text-nagorik-heading">Attached Photos</h4>
            <div className="flex flex-wrap gap-3">
              {filledPhotos.length ? (
                filledPhotos.map((src, i) => <img key={`${src.slice(-12)}-${i}`} src={src} alt="attached photo" className="h-[100px] w-[130px] rounded-[10px] border border-nagorik-border object-cover" />)
              ) : (
                <span className="text-[12.5px] text-nagorik-muted">No photos attached.</span>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-nagorik-soft-red px-[18px] py-3.5 text-nagorik-red">
              <PinIcon size={20} />
              <div>
                <b className="block text-[12px] text-nagorik-heading">Pinned Location</b>
                <span className="text-[12.5px] text-nagorik-secondary">{coordsText}</span>
              </div>
            </div>
          </div>

          <section className="mb-[22px] rounded-[18px] border border-nagorik-border bg-nagorik-surface p-[18px]">
              <p className="m-0 mb-2.5 ml-1 text-[12.5px] font-bold text-nagorik-heading">Location preview</p>
              <div className="relative cursor-crosshair overflow-hidden rounded-xl">
                <img src={mapImg} alt="Dhaka city map" className="h-[430px] w-full object-cover" />
                <svg className="map-pin" style={{ left: pin.left, top: pin.top }} width="34" height="44" viewBox="0 0 34 44">
                  <path d="M17 1C8.7 1 2 7.7 2 16c0 10.5 15 27 15 27s15-16.5 15-27C32 7.7 25.3 1 17 1z" fill="#C8102E" />
                  <circle cx="17" cy="16" r="6" fill="#fff" />
                </svg>
              </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-10">
            <button type="button" className="inline-flex items-center justify-center gap-[9px] rounded-full border-[1.5px] border-nagorik-border bg-white px-[56px] py-[17px] text-[15px] font-bold text-nagorik-secondary transition-[border-color_0.15s_ease,color_0.15s_ease] hover:border-nagorik-red hover:text-nagorik-red dark:bg-nagorik-surface" onClick={() => handleDirClick(-1)}>Back</button>
            <button type="button" className="rounded-full bg-nagorik-red px-[64px] py-[18px] text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red max-[900px]:w-full max-[900px]:justify-center" onClick={handleFinalSubmit}>Submit</button>
          </div>
        </section>

      </main>
    </>
  )
}