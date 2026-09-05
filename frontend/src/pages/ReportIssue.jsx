import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  findReport,
  submitReport,
  updateReport,
} from "../services/issuesService";
import {
  PinIcon,
  ClockIcon,
  UploadCameraIcon,
  BackArrowIcon,
  CheckIcon,
  ChevronDownIcon,
} from "../components/icons";

const STEP_TITLES = {
  1: "Issue Details",
  2: "Media & Location",
  3: "Review",
};

const STEP_LABELS = ["Details", "Media & Location", "Review"];
const DEFAULT_COORDS = "Dhanmondi, Dhaka (23.81° N, 90.41° E)";
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

/* ---------- stepper / progress bar ----------
   Display-only: currentStep is controlled entirely by the Next/Back/Preview
   buttons in the page body. The circles/labels below are NOT clickable on
   purpose, so a user can't skip ahead (or jump back) by tapping the stepper. */

function StepProgress({ currentStep }) {
  const total = STEP_LABELS.length;
  const fillPct = (currentStep / total) * 100;
  const markerLeftPct = ((currentStep - 0.5) / total) * 100;

  return (
    <div
      className={clsx(
        "mb-8",
        "w-full",
      )}
    >
      <div
        className={clsx(
          //progress bar full shape
          "relative",
          "h-[34px]",
          "w-full",
          "overflow-hidden",
          "rounded-full",
          "bg-nagorik-light-red",
        )}
      >
        <div
          className={clsx(
            //progress bar step 1 shape
            "absolute", 
            "inset-y-0", 
            "left-0", 
            "rounded-full", 
            "bg-gradient-to-r", 
            "from-nagorik-red", 
            "to-nagorik-red/25", 
            "transition-[width]", 
            "duration-300", 
            "ease-out"
          )}
          style={{ width: `${fillPct}%` }}
        />
        <div
          className={clsx(
            "absolute",
            "top-1/2",
            "flex",
            "h-5",
            "w-5",
            "-translate-y-1/2",
            "items-center",
            "justify-center",
            "rounded-full",
            "bg-white",
            "text-nagorik-red",
            "shadow-[0_2px_6px_rgba(0,0,0,0.25)]",
            "transition-[left]",
            "duration-300",
            "ease-out",
            "text-[12px]",
            "font-bold"
          )}
          style={{ left: `calc(${markerLeftPct}% - 18px)` }}
        >
          <CheckIcon />
        </div>
      </div>

      {/* Non-interactive step labels — plain divs, not buttons, so they can't be clicked */}
      <div className="mt-3 grid grid-cols-3">
        {STEP_LABELS.map((label, i) => {
          const s = i + 1;
          const isActive = currentStep === s;
          const isDone = currentStep > s;
          return (
            <div
              key={s}
              className="flex flex-col items-center gap-1.5 px-1 text-center"
            >
              <span
                className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold",
                  (isActive || isDone) && "bg-nagorik-red text-white",
                  !isActive &&
                    !isDone &&
                    "bg-nagorik-light-red text-nagorik-red",
                )}
              >
                {isDone ? "✓" : s}
              </span>
              <span
                className={clsx(
                  "text-[11px] sm:text-[13px] font-bold leading-tight",
                  isActive ? "text-nagorik-heading" : "text-nagorik-muted",
                )}
              >
                {label}
                {isActive ? " (active)" : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- main page ---------- */

export default function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  const editing = location.state?.editId
    ? findReport(location.state.editId)
    : null;

  // currentStep is the single source of truth for which step is shown —
  // only changed via goStep(), called from Next/Back/Preview buttons.
  const [currentStep, setCurrentStep] = useState(1);

  const [title, setTitle] = useState(() => editing?.title || "");
  const [category, setCategory] = useState(
    () => editing?.category || "Roads & Transportation",
  );
  const [priority, setPriority] = useState(() => editing?.priority || "Medium");
  const [area, setArea] = useState(() => editing?.area || "");
  const [date, setDate] = useState(() => editing?.date || "");
  const [description, setDescription] = useState(
    () => editing?.description || "",
  );

  const [roadNo, setRoadNo] = useState(() => editing?.roadNo || "");
  const [block, setBlock] = useState(() => editing?.block || "");
  const [addrArea, setAddrArea] = useState(() => editing?.addrArea || "");
  const [thana, setThana] = useState(() => editing?.thana || "");
  const [city, setCity] = useState(() => editing?.city || "");

  const [slots, setSlots] = useState(() => {
    const photos = editing?.photos || [];
    return [photos[0] || null, photos[1] || null, photos[2] || null];
  });
  const [coordsText, setCoordsText] = useState(
    () => editing?.coordsText || DEFAULT_COORDS,
  );
  const activeSlotRef = useRef(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    document.title = "Report an Issue — নাগরিক";
    document.documentElement.lang = "en";
  }, []);

  // The only place currentStep is allowed to change — called from explicit
  // Next / Back / Preview button handlers, never from the stepper itself.
  const goStep = (n) => {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDirClick = (dir) => {
    goStep(currentStep + dir);
  };

  const openPicker = (index) => {
    if (slots[index]) return;
    activeSlotRef.current = index;
    photoInputRef.current.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file || activeSlotRef.current === null) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const slotIndex = activeSlotRef.current;
      setSlots((prev) =>
        prev.map((s, i) => (i === slotIndex ? ev.target.result : s)),
      );
      activeSlotRef.current = null;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePhoto = (e, index) => {
    e.stopPropagation();
    setSlots((prev) => prev.map((s, i) => (i === index ? null : s)));
  };

  const detectLocation = () => {
    setCoordsText("Dhaka (23.81° N, 90.41° E)");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
      );
    }
  };

  const fullAddress = [
    roadNo && `Road: ${roadNo}`,
    block && `Block: ${block}`,
    addrArea && `Area: ${addrArea}`,
    thana && `Thana: ${thana}`,
    city && `City: ${city}`,
  ]
    .filter(Boolean)
    .join(", ");

  const reviewRows = [
    ["Issue Title", title],
    ["Category", category],
    ["Priority", priority],
    ["Area / Landmark", area],
    ["Date Noticed", date],
    ["Description", description],
    ["Full Address", fullAddress],
  ];

  const filledPhotos = slots.filter(Boolean);

  const handleFinalSubmit = () => {
    const reportData = {
      title,
      category,
      priority,
      area,
      date,
      description,
      roadNo,
      block,
      addrArea,
      thana,
      city,
      fullAddress,
      coordsText,
      photos: filledPhotos,
    };
    if (editing) {
      updateReport(editing.id, reportData);
      alert("Report updated!");
      navigate("/user");
    } else {
      submitReport(reportData);
      alert("Report submitted! Our team will review it soon.");
      navigate("/browse_feed");
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    goStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    goStep(3);
  };

  return (
    <main className="mx-auto w-full max-w-[1160px] overflow-x-hidden px-4 py-6 sm:px-7 sm:py-9">
      {/* Header row: icon-only back button (left), centered step title (middle), spacer (right) keeps the title visually centered on the page */}
      <div className="mb-6 grid grid-cols-[26px_1fr_26px] items-center gap-3 sm:mb-9 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate("/browse_feed")}
          aria-label="Back to feed"
          className="inline-flex items-center justify-center bg-transparent p-0 text-nagorik-red"
        >
          <BackArrowIcon />
        </button>
        <h1 className="truncate text-center text-[16px] font-extrabold text-nagorik-heading sm:text-[20px]">
          {`Step ${currentStep}/3: ${STEP_TITLES[currentStep]}`}
        </h1>
        <span aria-hidden="true" />
      </div>

      <StepProgress currentStep={currentStep} />

      {/* ========== STEP 1 : ISSUE DETAILS ========== */}
      <section
        className={clsx(
          currentStep === 1 ? "block" : "hidden",
        )}
      >
        <form
          id="report-step1"
          onSubmit={handleStep1Submit}
          className="flex w-full flex-col gap-5 sm:gap-7"
        >
          {/* Title — full width on its own row */}
          <div className="flex min-w-0 flex-col">
            <label
              htmlFor="issueTitle"
              className="mb-2.5 text-[15px] font-extrabold text-nagorik-heading sm:text-[17px]"
            >
              Title
            </label>
            <div className="relative min-w-0">
              <input
                id="issueTitle"
                type="text"
                maxLength={120}
                required
                placeholder="Pothole on Mirpur Road"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-w-0 rounded-full border border-nagorik-border bg-nagorik-cream py-4 pl-5 pr-14 text-[14px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted-soft"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-nagorik-muted-soft">
                {title.length}/120
              </span>
            </div>
          </div>

          {/* Category + Priority — mobile-first: stacked by default, side by side from sm: up */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="flex min-w-0 flex-col">
              <label
                htmlFor="issueCategory"
                className="mb-2.5 text-[15px] font-extrabold text-nagorik-heading sm:text-[17px]"
              >
                Category
              </label>
              <div className="relative min-w-0">
                <select
                  id="issueCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-w-0 appearance-none rounded-full border border-nagorik-border bg-nagorik-cream py-4 pl-5 pr-14 text-[14px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white cursor-pointer"
                >
                  <option>Roads & Transportation</option>
                  <option>Water Logging</option>
                  <option>Waste Management</option>
                  <option>Street Lights</option>
                  <option>Public Safety</option>
                  <option>Other</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-nagorik-red text-white">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            {/* Priority tick-pills: click to select, checkmark shows on the active pill */}
            <div className="flex min-w-0 flex-col">
              <label className="mb-2.5 text-[15px] font-extrabold text-nagorik-heading sm:text-[17px]">
                Priority
              </label>
              <div className="flex min-h-[54px] w-full flex-wrap items-center gap-2">
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPriority(opt)}
                      className={clsx(
                        "flex flex-1 basis-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-4 text-[12px] font-bold font-[inherit] transition-colors duration-150 sm:px-3 sm:text-[13px]",
                        isSelected
                          ? "border-nagorik-red-dark bg-white text-nagorik-red-dark"
                          : "border-nagorik-border bg-nagorik-cream text-nagorik-secondary hover:border-nagorik-red hover:text-nagorik-red",
                      )}
                    >
                      {isSelected && <CheckIcon />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-col">
            <label
              htmlFor="issueDesc"
              className="mb-2.5 text-[15px] font-extrabold text-nagorik-heading sm:text-[17px]"
            >
              Description
            </label>
            <textarea
              id="issueDesc"
              required
              placeholder="Type your description here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] w-full min-w-0 rounded-[22px] border border-nagorik-border bg-nagorik-cream px-5 py-4 text-[14px] text-nagorik-heading font-[inherit] outline-none resize-y leading-[1.6] transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted-soft"
            />
          </div>
        </form>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={() => goStep(3)}
            className="w-full rounded-full border border-nagorik-border bg-nagorik-cream px-10 py-4 text-[15px] font-bold text-nagorik-secondary font-[inherit] transition-colors duration-150 hover:border-nagorik-red hover:text-nagorik-red sm:w-auto"
          >
            Preview
          </button>
          <button
            type="submit"
            form="report-step1"
            className="w-full rounded-full bg-nagorik-red px-16 py-4 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red sm:w-auto"
          >
            Next
          </button>
        </div>
      </section>

      {/* ========== STEP 2 : MEDIA & LOCATION ==========
          Columns swapped: Location Address is now on the left, Upload Photos
          on the right. The photo card is shorter and carries the Back/Next
          buttons directly under the photo grid instead of a separate row. */}
      <section
        className={clsx(
          currentStep === 2 ? "block" : "hidden",
        )}
      >
        {/* Hidden form — its only job is to give the address/photo inputs (via form="report-step2")
            a shared submit target, triggered by the "Next" button inside the photo card. */}
        <form id="report-step2" onSubmit={handleStep2Submit} hidden></form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Location Address (moved left) */}
          <div className="flex min-w-0 flex-col rounded-[18px] border border-nagorik-border bg-nagorik-paper p-4">
            <h3 className="mb-0.5 text-[15px] font-extrabold text-nagorik-heading">
              Location Address
            </h3>
            <p className="mb-3 text-[11.5px] text-nagorik-muted">
              Give the full address or detect it automatically.
            </p>

            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="flex min-w-0 flex-col">
                <label
                  htmlFor="roadNo"
                  className="mb-1 text-[11.5px] font-bold text-nagorik-heading"
                >
                  Road No
                </label>
                <input
                  id="roadNo"
                  type="text"
                  form="report-step2"
                  placeholder="e.g. 27"
                  value={roadNo}
                  onChange={(e) => setRoadNo(e.target.value)}
                  className="w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-nagorik-cream px-3 py-2 text-[13px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <label
                  htmlFor="block"
                  className="mb-1 text-[11.5px] font-bold text-nagorik-heading"
                >
                  Block
                </label>
                <input
                  id="block"
                  type="text"
                  form="report-step2"
                  placeholder="e.g. D"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-nagorik-cream px-3 py-2 text-[13px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <label
                  htmlFor="addrArea"
                  className="mb-1 text-[11.5px] font-bold text-nagorik-heading"
                >
                  Area
                </label>
                <input
                  id="addrArea"
                  type="text"
                  form="report-step2"
                  required
                  placeholder="e.g. Dhanmondi"
                  value={addrArea}
                  onChange={(e) => setAddrArea(e.target.value)}
                  className="w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-nagorik-cream px-3 py-2 text-[13px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <label
                  htmlFor="thana"
                  className="mb-1 text-[11.5px] font-bold text-nagorik-heading"
                >
                  Thana
                </label>
                <input
                  id="thana"
                  type="text"
                  form="report-step2"
                  required
                  placeholder="e.g. Dhanmondi"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-nagorik-cream px-3 py-2 text-[13px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"
                />
              </div>

              <div className="col-span-2 flex min-w-0 flex-col">
                <label
                  htmlFor="city"
                  className="mb-1 text-[11.5px] font-bold text-nagorik-heading"
                >
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  form="report-step2"
                  required
                  placeholder="e.g. Dhaka"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full min-w-0 rounded-[12px] border-[1.5px] border-transparent bg-nagorik-cream px-3 py-2 text-[13px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white placeholder:text-nagorik-muted"
                />
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-nagorik-red px-4 py-2 text-[11.5px] font-bold text-white font-[inherit] transition-colors duration-150 hover:bg-nagorik-hover-red sm:w-fit sm:justify-start"
              onClick={detectLocation}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Use My Current Location
            </button>
            <p className="mt-auto flex flex-wrap items-center gap-1.5 pt-2.5 text-[11px] text-nagorik-muted">
              <ClockIcon size={11} /> Pinned:{" "}
              <b className="font-bold text-nagorik-secondary">{coordsText}</b>
            </p>
          </div>

          {/* Upload Photos (moved right, compact height + inline Back/Next nav) */}
          <div className="flex min-w-0 flex-col rounded-[18px] border border-nagorik-border bg-nagorik-paper p-4">
            <h3 className="mb-0.5 text-[15px] font-extrabold text-nagorik-heading">
              Upload Photos
            </h3>
            <p className="mb-3 text-[11.5px] text-nagorik-muted">
              Add up to 3 photos — clear daylight photos help faster resolution.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {[0, 1].map((index) => (
                <button
                  type="button"
                  key={index}
                  className="relative flex min-h-[68px] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[14px] border-2 border-dashed border-nagorik-light-red bg-nagorik-soft-red p-1.5 text-[9.5px] font-semibold text-nagorik-muted font-[inherit] transition-colors duration-150 hover:border-nagorik-red sm:text-[10px]"
                  onClick={() => openPicker(index)}
                >
                  {slots[index] ? (
                    <>
                      <img
                        src={slots[index]}
                        alt="preview"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-1 top-1 z-[2] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-nagorik-red/92 text-[11px] leading-none text-white cursor-pointer"
                        onClick={(e) => removePhoto(e, index)}
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCameraIcon />
                      <span>Add photo</span>
                    </>
                  )}
                </button>
              ))}
              <button
                type="button"
                className="relative flex min-h-[68px] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[14px] border-2 border-dashed border-nagorik-light-red bg-nagorik-soft-red p-1.5 text-[9.5px] font-semibold text-nagorik-muted font-[inherit] transition-colors duration-150 hover:border-nagorik-red sm:text-[10px]"
                onClick={() => openPicker(2)}
              >
                {slots[2] ? (
                  <>
                    <img
                      src={slots[2]}
                      alt="preview"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 z-[2] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-nagorik-red/92 text-[11px] leading-none text-white cursor-pointer"
                      onClick={(e) => removePhoto(e, 2)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-[24px] font-extralight leading-none text-nagorik-red">
                    +
                  </span>
                )}
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={photoInputRef}
              onChange={handlePhotoChange}
            />

            {/* Back / Next now live inside the photo card, freeing up the freed vertical space from the shorter tiles */}
            <div className="mt-auto flex items-center justify-between gap-2 pt-5 sm:gap-3">
              <button
                type="button"
                className="flex-1 rounded-full border border-nagorik-border bg-nagorik-cream px-3 py-3 text-[12px] font-bold text-nagorik-secondary font-[inherit] transition-colors duration-150 hover:border-nagorik-red hover:text-nagorik-red sm:px-4 sm:text-[13px]"
                onClick={() => handleDirClick(-1)}
              >
                Back
              </button>
              <button
                type="submit"
                form="report-step2"
                className="flex-1 rounded-full bg-nagorik-red px-3 py-3 text-[12px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red sm:px-4 sm:text-[13px]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STEP 3 : REVIEW ========== */}
      <section
        className={clsx(
          currentStep === 3 ? "block" : "hidden",
        )}
      >
        <div className="mb-6 rounded-[22px] border border-nagorik-border bg-nagorik-paper p-4 sm:mb-7 sm:p-7">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="mb-1 text-[16px] font-extrabold text-nagorik-heading sm:text-[17px]">
                Report Summary
              </h3>
              <p className="text-[12px] text-nagorik-muted sm:text-[12.5px]">
                Please double-check everything before submitting.
              </p>
            </div>
            <span
              className={clsx(
                "whitespace-nowrap rounded-full px-[18px] py-2 text-[12px] font-extrabold",
                /high/i.test(priority) && "bg-nagorik-red text-white",
                /low/i.test(priority) && "bg-[#E8F5EE] text-nagorik-green",
                !/high|low/i.test(priority) &&
                  "bg-nagorik-soft-red text-nagorik-red",
              )}
            >
              {priority}
            </span>
          </div>

          <div>
            {reviewRows.map(([k, v]) => (
              <div
                className="flex flex-col gap-1 border-b border-nagorik-cream py-[13px] text-[13px] sm:flex-row sm:gap-6 sm:text-[13.5px]"
                key={k}
              >
                <span className="shrink-0 font-semibold text-nagorik-muted sm:w-[190px]">
                  {k}
                </span>
                <span className="break-words font-bold text-nagorik-heading sm:text-right">
                  {v || "—"}
                </span>
              </div>
            ))}
          </div>

          <h4 className="mb-3 mt-5 text-[13px] font-extrabold text-nagorik-heading">
            Attached Photos
          </h4>
          <div className="flex flex-wrap gap-3">
            {filledPhotos.length ? (
              filledPhotos.map((src, i) => (
                <img
                  key={`${src.slice(-12)}-${i}`}
                  src={src}
                  alt="attached photo"
                  className="h-[90px] w-[110px] rounded-[10px] border border-nagorik-border object-cover sm:h-[100px] sm:w-[130px]"
                />
              ))
            ) : (
              <span className="text-[12.5px] text-nagorik-muted">
                No photos attached.
              </span>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-[16px] bg-nagorik-soft-red px-4 py-3.5 text-nagorik-red sm:px-[18px]">
            <PinIcon size={20} />
            <div className="min-w-0">
              <b className="block text-[12px] text-nagorik-heading">
                Pinned Location
              </b>
              <span className="break-words text-[12.5px] text-nagorik-secondary">
                {coordsText}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
          <button
            type="button"
            className="w-full rounded-full border border-nagorik-border bg-nagorik-cream px-10 py-4 text-[15px] font-bold text-nagorik-secondary font-[inherit] transition-colors duration-150 hover:border-nagorik-red hover:text-nagorik-red sm:w-auto"
            onClick={() => handleDirClick(-1)}
          >
            Back
          </button>
          <button
            type="button"
            className="w-full rounded-full bg-nagorik-red px-16 py-4 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red sm:w-auto"
            onClick={handleFinalSubmit}
          >
            Submit
          </button>
        </div>
      </section>
    </main>
  );
}