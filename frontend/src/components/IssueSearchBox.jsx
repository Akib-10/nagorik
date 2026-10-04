import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SearchIcon } from "./icons";
import { getFeedIssues } from "../services/issuesService";

// Same suggestion search the admin panel uses on Manage Issues, for the public
// side: type, get up to 5 matching issues in a dropdown, use the arrow keys /
// Enter or a click to choose one.
//
// variant "hero"   -> white pill used inside the red Browse Feed banner
// variant "header" -> grey pill used in the app header
//
// value / onChange are optional: pass them to control the text from outside
// (Browse Feed filters its list live), leave them out and the box keeps its
// own text (the header). onSubmit(text) fires on Enter, or when a suggestion
// is picked (with the suggestion's title).

const SUGGESTION_LIMIT = 5;
const POOL_TTL_MS = 60 * 1000;

// One shared copy of the public feed for every search box on the page,
// refreshed at most once a minute.
let pool = { at: 0, promise: null };
function loadPool() {
  if (!pool.promise || Date.now() - pool.at > POOL_TTL_MS) {
    pool = {
      at: Date.now(),
      promise: getFeedIssues().catch(() => {
        pool = { at: 0, promise: null };
        return [];
      }),
    };
  }
  return pool.promise;
}

// What was typed must be the START of the title (best), or the start of a word
// in the title / area / reporter.
function rankSuggestions(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const startsWord = (text) =>
    ` ${String(text || "").toLowerCase()}`.includes(` ${q}`);
  return items
    .map((issue) => {
      const title = String(issue.title || "").toLowerCase();
      let score = -1;
      if (title.startsWith(q)) score = 0;
      else if (startsWord(issue.title)) score = 1;
      else if (startsWord(issue.area) || startsWord(issue.reporter)) score = 2;
      return { issue, score };
    })
    .filter((m) => m.score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, SUGGESTION_LIMIT)
    .map(({ issue }) => ({
      id: issue.id,
      label: issue.title,
      sub: [issue.area, issue.reporter].filter(Boolean).join(" · "),
    }));
}

// Bolds the part of `text` the user has typed, when it sits at the start of a word.
function Highlight({ text, query }) {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const lower = text.toLowerCase();
  let at = lower.startsWith(q) ? 0 : lower.indexOf(" " + q);
  if (at > 0) at += 1;
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <strong className="font-extrabold text-nagorik-red">
        {text.slice(at, at + q.length)}
      </strong>
      {text.slice(at + q.length)}
    </>
  );
}

export default function IssueSearchBox({
  value,
  onChange,
  onSubmit,
  placeholder = "Search issues",
  variant = "header",
  className,
}) {
  const [inner, setInner] = useState("");
  const text = value !== undefined ? value : inner;
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  const setText = (next) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  // Load the candidates the first time the box is used.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadPool().then((list) => !cancelled && setItems(list));
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Close on outside click.
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const suggestions = rankSuggestions(items, text);
  const showList = open && text.trim() !== "" && suggestions.length > 0;

  const pick = (item) => {
    setOpen(false);
    setActive(-1);
    setText(item.label);
    onSubmit?.(item.label);
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (showList && e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (showList && e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showList && active >= 0) {
        pick(suggestions[active]);
      } else if (text.trim()) {
        setOpen(false);
        onSubmit?.(text.trim());
      }
    }
  };

  const hero = variant === "hero";

  return (
    <div ref={boxRef} className={clsx("relative", className)}>
      <div
        className={clsx(
          "flex w-full items-center gap-3",
          hero
            ? "rounded-full bg-white px-4 py-[9px]"
            : "rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-[9px] text-[13px] text-nagorik-muted",
        )}
      >
        <SearchIcon size={hero ? 18 : 16} />
        <div className="h-[18px] w-px bg-nagorik-border"></div>
        <input
          type="text"
          value={text}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={clsx(
            "w-full border-0 bg-transparent text-[14px] font-[inherit] outline-none",
            hero
              ? "text-nagorik-body-text placeholder:text-nagorik-muted"
              : "text-nagorik-body-text",
          )}
        />
      </div>

      {/* The list is its own absolutely positioned layer. None of its parents
          may use overflow-hidden, otherwise it gets cut off at their edge. */}
      {showList && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 m-0 mt-2 list-none rounded-2xl border border-nagorik-line bg-nagorik-paper p-1.5 shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li key={s.id} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                onMouseEnter={() => setActive(i)}
                className={clsx(
                  "flex w-full cursor-pointer flex-col items-start rounded-xl border-0 px-3 py-2 text-left font-[inherit] transition-colors duration-100",
                  i === active ? "bg-nagorik-surface-2" : "bg-transparent",
                )}
              >
                <span className="w-full truncate text-[13px] font-semibold normal-case text-nagorik-heading">
                  <Highlight text={s.label} query={text} />
                </span>
                {s.sub && (
                  <span className="w-full truncate text-[11.5px] font-normal normal-case text-nagorik-muted">
                    {s.sub}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
