import { useEffect, useState } from 'react'
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import {
  getMyReports,
  getUpvotedIssues,
  deleteReport,
} from "../services/issuesService";
import { getUser } from "../services/authService";
import profileBg from "../assets/images/grey-container.png";
import {
  HomeGlyph,
  PinIcon,
  ClockIcon,
  VoteUpIcon,
  CommentIcon,
  EyeIcon,
  EditPenIcon,
  TrashIcon,
  ShieldIcon,
} from "../components/icons";

function ReportRow({ issue, expanded, onView, onEdit, onDelete }) {
  const badgeBg = issue.statusClass === 'st-progress' ? 'bg-[#B87613]' : issue.statusClass === 'st-done' ? 'bg-nagorik-green' : 'bg-nagorik-red'

  return (
    <article className="flex items-center gap-[18px] rounded-2xl border border-nagorik-light-red bg-[linear-gradient(90deg,var(--color-nagorik-soft-red),var(--color-nagorik-paper)_62%)] p-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="h-[118px] w-[118px] shrink-0 overflow-hidden rounded-xl bg-nagorik-surface-2">
        <img src={issue.img} alt={issue.title} className="h-full w-full object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="m-0 text-[15px] font-extrabold text-nagorik-heading">{issue.title}</h3>
          <span className={`inline-flex items-center gap-[5px] rounded-full px-[11px] py-1 text-[10.5px] font-bold text-white ${badgeBg}`}>
            <span className="h-[5px] w-[5px] rounded-full bg-white"></span>
            {issue.statusLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-[12px] text-nagorik-secondary">
          <span className="flex items-center gap-[5px]">
            <PinIcon size={12} />
            {issue.area}
          </span>
          <span className="flex items-center gap-[5px]">
            <ClockIcon size={12} />
            {issue.time}
          </span>
        </div>
        <div className="flex items-center gap-3.5 text-[11.5px] font-bold text-nagorik-red dark:text-[#FF7080]">
          <span className="flex items-center gap-1">
            <VoteUpIcon size={12} />
            {issue.up} upvotes
          </span>
          <span className="flex items-center gap-1">
            <CommentIcon size={12} />
            {issue.comments} comments
          </span>
        </div>
        <div className="mt-[3px] flex gap-2">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded-full border-none px-3.5 py-2 text-[11.5px] font-bold text-white cursor-pointer whitespace-nowrap transition-colors duration-150 ${expanded ? 'border-[1.5px] border-nagorik-red bg-transparent text-nagorik-red px-[12.5px] py-[6.5px]' : 'bg-nagorik-red hover:bg-nagorik-hover-red'}`}
            onClick={() => onView(issue.id)}
          >
            <EyeIcon />
            {expanded ? "Hide" : "View"}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
            onClick={() => onEdit(issue.id)}
          >
            <EditPenIcon size={12} />
            Edit
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
            onClick={() => onDelete(issue.id)}
          >
            <TrashIcon />
            Delete
          </button>
        </div>
        {expanded && (
          <div className="mt-3 border-t border-nagorik-border pt-1">
            <div className="flex gap-[24px] border-b border-nagorik-cream py-3 text-[13.5px]">
              <span className="w-[190px] shrink-0 text-nagorik-muted font-semibold">Category</span>
              <span className="font-bold text-nagorik-heading break-words">{issue.category || "—"}</span>
            </div>
            <div className="flex gap-[24px] border-b border-nagorik-cream py-3 text-[13.5px]">
              <span className="w-[190px] shrink-0 text-nagorik-muted font-semibold">Priority</span>
              <span className="font-bold text-nagorik-heading break-words">{issue.priority || "—"}</span>
            </div>
            <div className="flex gap-[24px] border-b border-nagorik-cream py-3 text-[13.5px]">
              <span className="w-[190px] shrink-0 text-nagorik-muted font-semibold">Description</span>
              <span className="font-bold text-nagorik-heading break-words">{issue.description || "—"}</span>
            </div>
            <div className="flex gap-[24px] py-3 text-[13.5px]">
              <span className="w-[190px] shrink-0 text-nagorik-muted font-semibold">Full Address</span>
              <span className="font-bold text-nagorik-heading break-words">{issue.address || "—"}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState(() => getMyReports());
  const [expandedId, setExpandedId] = useState(null);
  const upvotedIssues = getUpvotedIssues();
  const userData = getUser();
  const displayName = userData.name || "Nagorik User";

  useEffect(() => {
    document.title = "Profile — নাগরিক";
    document.documentElement.lang = "bn";
  }, []);

  const handleView = (id) => setExpandedId((prev) => (prev === id ? null : id));
  const handleEdit = (id) => navigate("/report", { state: { editId: id } });
  const handleDelete = (id) => {
    const report = reports.find((r) => r.id === id);
    if (!window.confirm(`Delete "${report ? report.title : "this report"}"? This cannot be undone.`)) return;
    setReports(deleteReport(id));
    if (expandedId === id) setExpandedId(null);
  };

  const resolvedCount = reports.filter((r) => r.statusLabel === "Resolved").length;

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          {
            label: "HOME",
            variant: "inactive",
            to: "/browse_feed",
            icon: <HomeGlyph />,
          },
        ]}
        showLogout
      />

      <div className="mx-auto max-w-[1160px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        <section className="relative isolate z-0 flex flex-col overflow-hidden rounded-[18px] p-[30px_32px_26px]" style={{ backgroundImage: `url(${profileBg}), linear-gradient(135deg, #d5d5d3, #c4c4c2)`, backgroundSize: 'cover, cover', backgroundPosition: 'center, center', backgroundRepeat: 'no-repeat, no-repeat' }}>
          <div className="flex items-start justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
            <div className="flex items-center gap-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full bg-white text-[32px] font-extrabold text-nagorik-red shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] dark:bg-nagorik-surface-2">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="mb-1 text-[22px] font-extrabold text-nagorik-red">{displayName}</h1>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#a8525c] dark:text-[#D98A93]">
                  <ClockIcon size={13} />
                  Joined Date: 04 Nov, 2024
                </span>
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-[7px] self-start rounded-full bg-nagorik-red px-5 py-[11px] text-[12.5px] font-bold tracking-[0.5px] text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)] max-[760px]:justify-center"
              onClick={() => navigate("/edit_profile")}
            >
              <EditPenIcon size={13} />
              EDIT PROFILE
            </button>
          </div>

          <div className="mt-auto pt-6">
            <h2 className="mb-3 text-[15px] font-extrabold text-[#26261f] dark:text-nagorik-heading">Contributions</h2>
            <div className="grid grid-cols-4 gap-[18px]">
              {[
                { label: 'Issues Reported', icon: <EditPenIcon size={17} />, count: reports.length },
                { label: 'Upvotes Given', icon: <VoteUpIcon size={17} />, count: upvotedIssues.length },
                { label: 'Comments made', icon: <CommentIcon size={17} />, count: 123 },
                { label: 'Issues resolved', icon: <ShieldIcon size={17} />, count: resolvedCount },
              ].map((card) => (
                <div className="flex min-h-[98px] flex-col rounded-[10px] bg-white p-[13px_18px_14px] shadow-[0_6px_14px_-10px_rgba(0,0,0,0.3)] dark:bg-nagorik-surface" key={card.label}>
                  <span className="text-[12px] font-semibold text-[#a3a39e]">{card.label}</span>
                  <span className="mt-auto flex items-center gap-2.5 pt-2.5 text-nagorik-red">
                    {card.icon}
                    <span className="text-[28px] font-extrabold leading-none text-[#111110] dark:text-nagorik-heading">{card.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TABS */}
        <div className="flex gap-2.5 pt-[26px]">
          <button
            type="button"
            className={`rounded-full border px-[22px] py-[9px] text-[13px] font-bold transition-all duration-150 ${
              activeTab === "reports"
                ? 'border-nagorik-red bg-nagorik-red text-white'
                : 'border-nagorik-border bg-nagorik-paper text-nagorik-red hover:bg-nagorik-light-red dark:text-[#FF7080]'
            }`}
            onClick={() => setActiveTab("reports")}
          >
            My Reports
          </button>
          <button
            type="button"
            className={`rounded-full border px-[22px] py-[9px] text-[13px] font-bold transition-all duration-150 ${
              activeTab === "upvoted"
                ? 'border-nagorik-red bg-nagorik-red text-white'
                : 'border-nagorik-border bg-nagorik-paper text-nagorik-red hover:bg-nagorik-light-red dark:text-[#FF7080]'
            }`}
            onClick={() => setActiveTab("upvoted")}
          >
            Upvoted
          </button>
          <button
            type="button"
            className="rounded-full border border-nagorik-border bg-nagorik-paper px-[22px] py-[9px] text-[13px] font-bold text-nagorik-red transition-all duration-150 hover:bg-nagorik-light-red dark:text-[#FF7080]"
            onClick={() => navigate("/settings")}
          >
            Settings
          </button>
        </div>

        {/* MY REPORTS */}
        <div className={activeTab === "reports" ? "block" : "hidden"}>
          <div className="mt-[26px] mb-3.5 flex items-center justify-between">
            <h2 className="m-0 text-[17px] font-extrabold text-nagorik-heading">Reports submitted by you</h2>
            <span className="text-[13px] text-nagorik-muted">{reports.length} total</span>
          </div>
          <div className="flex flex-col gap-5">
            {reports.length ? (
              reports.map((issue) => (
                <ReportRow
                  key={issue.id}
                  issue={issue}
                  expanded={expandedId === issue.id}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p className="py-12 text-center text-[14px] text-nagorik-muted">
                You haven't reported any issues yet.
              </p>
            )}
          </div>
        </div>

        {/* UPVOTED */}
        <div className={activeTab === "upvoted" ? "block" : "hidden"}>
          <div className="mt-[26px] mb-3.5 flex items-center justify-between">
            <h2 className="m-0 text-[17px] font-extrabold text-nagorik-heading">Issues you upvoted</h2>
            <span className="text-[13px] text-nagorik-muted">{upvotedIssues.length} total</span>
          </div>
          <div className="flex flex-col gap-5">
            {upvotedIssues.map((issue) => (
              <ReportRow
                key={issue.id}
                issue={{ ...issue, statusClass: "", statusLabel: "Open" }}
                expanded={false}
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
