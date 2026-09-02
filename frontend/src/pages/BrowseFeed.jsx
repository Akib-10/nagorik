import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { getFeedIssues, getTrendingIssues } from "../services/issuesService";
import heroImg from "../assets/images/artwork_red_container.png";
import {
  HomeGlyph,
  SearchIcon,
  PinIcon,
  UserGlyph,
  ClockIcon,
  VoteUpIcon,
  VoteDownIcon,
  CommentIcon,
  RepostIcon,
  ShareNodesIcon,
  PlusIcon,
} from "../components/icons";

const TABS = ["latest", "ongoing", "trending", "all"];

function formatDown(value) {
  const n = Number(value);
  return Number.isNaN(n) ? value : String(n).padStart(2, "0");
}

function IssueCard({ issue, myVote, onVote, onOpen }) {
  const upCount = issue.up + (myVote === "up" ? 1 : 0);
  const downCount = formatDown(
    Number(issue.down) + (myVote === "down" ? 1 : 0),
  );

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  const badgeBg =
    issue.statusClass === "st-progress"
      ? "bg-[#B87613]"
      : issue.statusClass === "st-done"
        ? "bg-nagorik-green"
        : "bg-nagorik-red";

  return (
    <article
      className="flex gap-5 rounded-2xl border border-nagorik-light-red bg-[linear-gradient(90deg,var(--color-nagorik-soft-red),var(--color-nagorik-paper)_55%)] p-3.5 transition-all duration-150 dark:bg-[linear-gradient(90deg,var(--color-nagorik-soft-red),var(--color-nagorik-paper)_55%)] max-[760px]:flex-col"
      onClick={() => onOpen(issue.id)}
      style={{ cursor: "pointer" }}
    >
      <div className="h-[158px] w-[210px] shrink-0 overflow-hidden rounded-xl bg-nagorik-surface-2 max-[760px]:h-[180px] max-[760px]:w-full">
        <img
          src={issue.img}
          alt={issue.alt}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2.5">
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full py-[5px] pl-[10px] pr-[14px] text-[12px] font-bold text-white ${badgeBg}`}
        >
          <span className="h-[6px] w-[6px] rounded-full bg-white"></span>
          {issue.statusLabel}
        </span>
        <h3 className="m-0 text-[18px] font-extrabold text-nagorik-red dark:text-[#FF7080]">
          {issue.title}
        </h3>
        <div className="flex flex-wrap items-center gap-[22px] text-[13px] text-nagorik-secondary">
          <span className="flex items-center gap-1.5">
            <PinIcon size={14} />
            {issue.area}
          </span>
          <span className="flex items-center gap-1.5">
            <UserGlyph size={14} />
            {issue.reporter}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon size={14} />
            {issue.time}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <div className="flex overflow-hidden rounded-full bg-nagorik-red">
            <button
              type="button"
              className={`flex items-center gap-1.5 bg-transparent px-3.5 py-[9px] text-[13px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red ${myVote === "up" ? "bg-nagorik-hover-red" : ""}`}
              onClick={stop(() => onVote(issue.id, "up"))}
            >
              <VoteUpIcon size={14} />
              {upCount}
            </button>
            <div className="h-4 w-px bg-white/35"></div>
            <button
              type="button"
              className={`flex items-center gap-1.5 bg-transparent px-3.5 py-[9px] text-[13px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red ${myVote === "down" ? "bg-nagorik-hover-red" : ""}`}
              onClick={stop(() => onVote(issue.id, "down"))}
            >
              <VoteDownIcon size={14} />
              {downCount}
            </button>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-nagorik-red px-4 py-[9px] text-[13px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red"
            onClick={stop(() => onOpen(issue.id))}
          >
            <CommentIcon size={14} />
            {issue.comments}
          </button>
          <button
            type="button"
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-nagorik-red text-white transition-colors duration-150 hover:bg-nagorik-hover-red"
            onClick={stop(() => {})}
          >
            <RepostIcon />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-nagorik-red px-4 py-[9px] text-[13px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red"
            onClick={stop(() => {})}
          >
            <ShareNodesIcon />
            share
          </button>
        </div>
      </div>
    </article>
  );
}

export default function BrowseFeed() {
  const [activeTab, setActiveTab] = useState("latest");
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [votes, setVotes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "নাগরিক | Civic Issues";
    document.documentElement.lang = "bn";
  }, []);

  const feedIssues = useMemo(() => getFeedIssues(), []);
  const trendingIssues = useMemo(() => getTrendingIssues(), []);

  const visibleIssues = useMemo(() => {
    let list = feedIssues;
    if (activeTab === "ongoing")
      list = list.filter((i) => i.statusLabel === "Ongoing");
    if (activeTab === "trending") list = [...list].sort((a, b) => b.up - a.up);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((i) =>
        [i.title, i.area, i.reporter, i.category]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [feedIssues, activeTab, query]);

  const handleVote = (id, dir) => {
    setVotes((prev) => ({ ...prev, [id]: prev[id] === dir ? null : dir }));
  };

  const openPost = (id) => {
    navigate(`/post/${id}`);
  };

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          {
            label: "HOME",
            to: "/browse-feed",
            variant: "active",
            icon: <HomeGlyph />,
          },
        ]}
        showIconButtons
      />

      {/* ================= HERO ================= */}
      <div className="mx-auto max-w-[1160px] px-7 pt-7 max-[760px]:px-4">
        <section
          className="relative isolate z-0 flex items-start justify-between overflow-hidden rounded-[18px] px-[34px] py-6 shadow-[0_12px_30px_-14px_rgba(140,11,34,0.55)] max-[1100px]:flex-col max-[1100px]:gap-5"
          style={{
            backgroundImage: `url(${heroImg}), linear-gradient(135deg, #C8102E, #8C0B22)`,
            backgroundSize: "cover, cover",
            backgroundPosition: "center, center",
            backgroundRepeat: "no-repeat, no-repeat",
          }}
        >
          <div className="relative z-[1] max-w-[560px] flex-1">
            <h1 className="mb-7.5 text-[28px] font-extrabold tracking-[0.2px] text-white">
              Dhaka Civic Issues
            </h1>
            <p className="mb-8 text-[14px] text-white/90 leading-relaxed max-[760px]:hidden">
              Report local problem, vote on urgent issues, track resolution
              progress.
            </p>
            <p className="mb-8 hidden text-[14px] text-white/90 leading-relaxed max-[760px]:block">
              Report problem and track resolution progress.
            </p>
            <div className="mt-4 flex max-w-[380px] items-center gap-3 rounded-full bg-white px-4 py-[9px] w-full">
              <SearchIcon size={18} />
              <div className="h-[18px] w-px bg-nagorik-border"></div>
              <input
                type="text"
                placeholder="Search issues by title, area, category"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 bg-transparent text-[14px] text-nagorik-body-text font-[inherit] outline-none placeholder:text-nagorik-muted"
              />
            </div>
          </div>
          <div className="relative z-[1] ml-6 flex shrink-0 flex-col gap-[10px] text-right max-[1100px]:ml-0 max-[1100px]:flex-row max-[1100px]:text-left max-[1100px]:justify-between max-[1100px]:w-full max-[1100px]:gap-20">
            <div className="flex flex-col items-center">
              <div className="text-[24px] font-extrabold leading-none text-white">
                45
              </div>
              <div className="mt-0.5 text-center text-[11px] text-white/85">Open</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[24px] font-extrabold leading-none text-white">
                31
              </div>
              <div className="mt-0.5 text-center text-[11px] text-white/85">
                Progressing 
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-[24px] font-extrabold leading-none text-white">
                14
              </div>
              <div className="mt-0.5 text-center text-[11px] text-white/85">received</div>
            </div>
          </div>
        </section>
      </div>

      {/* ================= TABS ================= */}
      <div
        className="mx-auto flex max-w-[1160px] gap-2.5 px-7 pt-6 max-[760px]:px-4"
        id="tabs"
      >
        {TABS.map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            className={`rounded-full border px-[22px] py-[9px] text-[13px] font-bold transition-all duration-150 ${
              activeTab === tabKey
                ? "border-nagorik-red bg-nagorik-red text-white"
                : "border-nagorik-border bg-nagorik-paper text-nagorik-red hover:bg-nagorik-light-red dark:text-[#FF7080]"
            }`}
            onClick={() => setActiveTab(tabKey)}
          >
            {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
          </button>
        ))}
      </div>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="mx-auto grid max-w-[1160px] grid-cols-[1fr_320px] gap-5 items-start px-7 py-5 pb-[60px] max-[1100px]:grid-cols-1 max-[760px]:px-4">
        {/* Issues Feed */}
        <div className="flex flex-col gap-5" id="issuesList">
          {visibleIssues.length ? (
            visibleIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                myVote={votes[issue.id] || null}
                onVote={handleVote}
                onOpen={openPost}
              />
            ))
          ) : (
            <p className="py-12 text-center text-[14px] text-nagorik-muted">
              No issues match your search. Try a different keyword or check the
              other tabs.
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside className="sticky top-[90px] flex flex-col gap-5 max-[1100px]:static">
          <div className="rounded-2xl bg-[linear-gradient(160deg,var(--color-nagorik-red),var(--color-nagorik-red-dark))] p-5 text-white">
            <h3 className="mb-3.5 flex items-center gap-2 text-[17px] font-extrabold">
              🔥 Trending issues
            </h3>

            {trendingIssues.map((item, index) => (
              <div
                className="flex gap-3 border-b border-white/20 py-3 first:pt-0 last:border-b-0 last:pb-0"
                key={`${item.id}-${index}`}
                onClick={() => openPost(item.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[10px] bg-white">
                  <img
                    src={item.img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="mb-1.5 text-[13.5px] font-bold leading-[1.3]">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3.5 text-[11.5px] text-white/85">
                    <span className="flex items-center gap-1">
                      ⬆ {item.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      🕒 {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-nagorik-red-dark p-[22px] text-white">
            <h3 className="mb-2 text-[18px] font-extrabold">
              Report a problem?
            </h3>
            <p className="mb-[18px] text-[13.5px] leading-[1.5] text-white/85">
              Help your community by reporting civic issue in your
              neighbourhood.
            </p>
            <Link
              to="/report"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-nagorik-red px-3 py-3 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red"
            >
              <PlusIcon />
              REPORT ISSUE
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
