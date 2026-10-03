import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  findReport,
  submitReport,
  updateReport,
} from "../services/issuesService";
import { getCategories } from "../services/categoryService";
import {
  MAX_ISSUE_MEDIA_COUNT,
  validateMediaFile,
  mediaResourceType,
  formatBytes,
} from "../services/mediaService";
import {
  PinIcon,
  ClockIcon,
  UploadCameraIcon,
  BackArrowIcon,
  CheckIcon,
  ChevronDownIcon,
} from "../components/icons";
import AppHeader from "../components/AppHeader";
import LandingFooter from "../components/LandingFooter";

const STEP_TITLES = {
  1: "Issue Details",
  2: "Media & Location",
  3: "Review",
};

const STEP_LABELS = ["Details", "Media & Location", "Review"];
  const DEFAULT_COORDS = "";
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
          "relative",
          "h-[34px]",
          "w-full",
          "overflow-hidden",
          "rounded-full",
          "bg-nagorik-light-red",
        )}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-nagorik-red to-nagorik-red/25 transition-[width] duration-300 ease-out"
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="absolute top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-white text-nagorik-red shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-[left] duration-300 ease-out text-[12px] font-bold"
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
  const editId = location.state?.editId || null;
  const [editing, setEditing] = useState(null);

  // currentStep is the single source of truth for which step is shown —
  // only changed via goStep(), called from Next/Back/Preview buttons.
  const [currentStep, setCurrentStep] = useState(1);

  const [title, setTitle] = useState("");
  // Category options come from the admin-managed list (Admin Panel -> Categories).
  const [category, setCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoriesState, setCategoriesState] = useState("loading"); // loading | ready | error
  const [priority, setPriority] = useState("Medium");
  const [area, setArea] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [roadNo, setRoadNo] = useState("");
  const [block, setBlock] = useState("");
  const [addrArea, setAddrArea] = useState("");
  const [thana, setThana] = useState("");
  const [city, setCity] = useState("");
  
  //for pic stored
  // Each item: { id, kind: 'file'|'existing', file?, url, resourceType,
  //              name, size, publicId? }. New files are uploaded to Cloudinary
  // on submit — never stored as base64 or in localStorage.
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const photoInputRef = useRef(null);

  useEffect(() => {
    document.title = "Report an Issue — নাগরিক";
    document.documentElement.lang = "en";
  }, []);

  // Fill the Category dropdown from the admin-managed list.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((list) => {
        if (cancelled) return;
        setCategoryOptions(Array.isArray(list) ? list : []);
        setCategoriesState("ready");
      })
      .catch(() => {
        if (!cancelled) setCategoriesState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load a report from the backend when editing via ?editId from the profile,
  // and seed the form from it in the same async flow. Doing this in a separate
  // effect that reacts to `editing` would setState synchronously in the effect
  // body and cause an extra cascading render on every load.
  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await findReport(editId);
        if (cancelled) return;
        setEditing(found);
        setTitle(found.title || "");
        setCategory(found.category || "");
        setPriority(found.priority || "Medium");
        setArea(found.area || "");
        setDate(found.date || "");
        setDescription(found.description || "");
        setRoadNo(found.roadNo || "");
        setBlock(found.block || "");
        setAddrArea(found.address || "");
        setThana(found.thana || "");
        setCity(found.city || "");
        const existingMedia = (found.media || [])
          .filter((m) => m.url)
          .map((m) => ({
            id: `existing-${m.publicId || m.url}`,
            kind: "existing",
            url: m.url,
            resourceType: m.resourceType || "image",
            publicId: m.publicId || "",
            name: m.publicId ? m.publicId.split("/").pop() : "Existing media",
            size: m.bytes || 0,
          }));
        setMediaItems(existingMedia);

      } catch {
        if (!cancelled) {
          alert("Could not load the report for editing.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId]);

  // The only place currentStep is allowed to change — called from explicit
  // Next / Back / Preview button handlers, never from the stepper itself.
  const goStep = (n) => {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // What the dropdown offers. When editing a report whose category an admin has
  // since removed, keep that one option so the report doesn't silently change.
  const categoryNames = categoryOptions.map((c) => c.name);
  if (category && !categoryNames.includes(category)) categoryNames.unshift(category);
  // Until the person picks one, the first available category is selected.
  const selectedCategory = category || categoryNames[0] || "";

  const handleDirClick = (dir) => {
    goStep(currentStep + dir);
  };

  const mediaId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const openPicker = () => {
    if (mediaItems.length >= MAX_ISSUE_MEDIA_COUNT) {
      setMediaError(`You can add up to ${MAX_ISSUE_MEDIA_COUNT} files.`);
      return;
    }
    photoInputRef.current?.click();
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    const next = [...mediaItems];
    let error = "";
    for (const file of files) {
      if (next.length >= MAX_ISSUE_MEDIA_COUNT) {
        error = `You can add up to ${MAX_ISSUE_MEDIA_COUNT} files.`;
        break;
      }
      const check = validateMediaFile(file);
      if (check) {
        error = check;
        continue;
      }
      next.push({
        id: mediaId(),
        kind: "file",
        file,
        url: URL.createObjectURL(file),
        resourceType: mediaResourceType(file),
        name: file.name,
        size: file.size,
      });
    }
    setMediaItems(next);
    setMediaError(error);
  };

  const removeMedia = (e, id) => {
    e.stopPropagation();
    setMediaError("");
    setMediaItems((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target?.kind === "file" && target.url?.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  const detectLocation = () => {
    // Location detection functionality removed
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
    ["Category", selectedCategory],
    ["Priority", priority],
    ["Area / Landmark", area],
    ["Thana", thana],
    ["City", city],
    ["Date Noticed", date],
    ["Description", description],
    ["Full Address", fullAddress],
  ];

  const submitMedia = mediaItems.map((item) =>
    item.kind === "existing"
      ? {
          kind: "existing",
          publicId: item.publicId,
          resourceType: item.resourceType,
        }
      : {
          kind: "file",
          file: item.file,
          resourceType: item.resourceType,
        },
  );

  const handleFinalSubmit = async () => {
    if (submitting) return;
    const reportData = {
      title,
      category: selectedCategory,
      priority,
      area,
      date,
      description,
      thana,
      city,
      fullAddress,
      mediaItems: submitMedia,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await updateReport(editing.id, reportData);
        alert("Report updated!");
      } else {
        const created = await submitReport(reportData);
        alert(
          created?.moderationStatus === "pending"
            ? "Report submitted! It will appear in the public feed once an admin approves it."
            : "Report submitted! It is now live in the public feed.",
        );
      }
      mediaItems.forEach((m) => {
        if (m.kind === "file" && m.url?.startsWith("blob:")) {
          URL.revokeObjectURL(m.url);
        }
      });
      navigate("/user"); // it isn't in the feed yet, so send them to their own reports
    } catch (err) {
      alert(
        err.message ||
          (editing
            ? "Failed to update report."
            : "Failed to submit report. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert("Categories could not be loaded yet. Please wait a moment and try again.");
      return;
    }
    goStep(2);
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    goStep(3);
  };

  return (
    <>
      <AppHeader />
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
                  value={selectedCategory}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  disabled={categoryNames.length === 0}
                  className="w-full min-w-0 appearance-none rounded-full border border-nagorik-border bg-nagorik-cream py-4 pl-5 pr-14 text-[14px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {categoryNames.length === 0 && (
                    <option value="">
                      {categoriesState === "loading"
                        ? "Loading categories…"
                        : "Categories unavailable"}
                    </option>
                  )}
                  {categoryNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
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

          {/* Date Noticed — new date picker field */}
          <div className="flex min-w-0 flex-col">
            <label
              htmlFor="issueDate"
              className="mb-2.5 text-[15px] font-extrabold text-nagorik-heading sm:text-[17px]"
            >
              Date Noticed
            </label>
            <input
              id="issueDate"
              type="date"
              required
              max={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full min-w-0 rounded-full border border-nagorik-border bg-nagorik-cream py-4 pl-5 pr-5 text-[14px] text-nagorik-heading font-[inherit] outline-none transition-colors duration-150 focus:border-nagorik-red focus:bg-white"
            />
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



          </div>

          {/* Upload Photos (moved right, compact height + inline Back/Next nav) */}
          <div className="flex min-w-0 flex-col rounded-[18px] border border-nagorik-border bg-nagorik-paper p-4">
            <h3 className="mb-0.5 text-[15px] font-extrabold text-nagorik-heading">
              Upload Photos &amp; Videos
            </h3>
            <p className="mb-3 text-[11.5px] text-nagorik-muted">
              Add up to {MAX_ISSUE_MEDIA_COUNT} photos or videos — clear media helps faster resolution.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="relative flex min-h-[68px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[14px] border-2 border-nagorik-light-red bg-nagorik-soft-red"
                >
                  {item.resourceType === "video" ? (
                    <video
                      src={item.url}
                      className="absolute inset-0 h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 z-[2] flex h-[20px] w-[20px] items-center justify-center rounded-full bg-nagorik-red/92 text-[11px] leading-none text-white cursor-pointer"
                    onClick={(e) => removeMedia(e, item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {mediaItems.length < MAX_ISSUE_MEDIA_COUNT && (
                <button
                  type="button"
                  className="relative flex min-h-[68px] min-w-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-[14px] border-2 border-dashed border-nagorik-light-red bg-nagorik-soft-red p-1.5 text-[9.5px] font-semibold text-nagorik-muted font-[inherit] transition-colors duration-150 hover:border-nagorik-red sm:text-[10px]"
                  onClick={openPicker}
                >
                  <UploadCameraIcon />
                  <span>Add media</span>
                </button>
              )}
            </div>

            {mediaItems.length > 0 && (
              <ul className="mt-2.5 flex flex-col gap-1">
                {mediaItems.map((item) => (
                  <li
                    key={`${item.id}-meta`}
                    className="flex items-center justify-between gap-2 text-[10.5px] text-nagorik-muted"
                  >
                    <span className="min-w-0 truncate">{item.name}</span>
                    <span className="shrink-0 font-semibold text-nagorik-secondary">
                      {formatBytes(item.size)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {mediaError && (
              <p className="mt-2 text-[11px] font-semibold text-nagorik-red">
                {mediaError}
              </p>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              multiple
              hidden
              ref={photoInputRef}
              onChange={handleMediaChange}
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
                {/* min-w-0 + flex-1 makes the value fill the row. The description
                    is justified with its last line pushed to the right edge. */}
                <span
                  className={clsx(
                    "min-w-0 flex-1 break-words font-bold text-nagorik-heading",
                    k === "Description"
                      ? "whitespace-pre-line text-justify [text-align-last:right] [hyphens:auto]"
                      : "sm:text-right",
                  )}
                >
                  {v || "—"}
                </span>
              </div>
            ))}
          </div>

          <h4 className="mb-3 mt-5 text-[13px] font-extrabold text-nagorik-heading">
            Attached Photos &amp; Videos
          </h4>
          <div className="flex flex-wrap gap-3">
            {mediaItems.length ? (
              mediaItems.map((item) =>
                item.resourceType === "video" ? (
                  <video
                    key={item.id}
                    src={item.url}
                    className="h-[90px] w-[110px] rounded-[10px] border border-nagorik-border object-cover sm:h-[100px] sm:w-[130px]"
                    muted
                    playsInline
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img
                    key={item.id}
                    src={item.url}
                    alt={item.name}
                    className="h-[90px] w-[110px] rounded-[10px] border border-nagorik-border object-cover sm:h-[100px] sm:w-[130px]"
                  />
                ),
              )
            ) : (
              <span className="text-[12.5px] text-nagorik-muted">
                No media attached.
              </span>
            )}
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
            className="w-full rounded-full bg-nagorik-red px-16 py-4 text-[15px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            onClick={handleFinalSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </section>
      </main>
      <LandingFooter />
    </>
  );
}