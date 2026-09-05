import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import { getMyReports, getUpvotedIssues, deleteReport } from "../services/issuesService";
import { getUser } from "../services/authService";
import profileBg from "../assets/images/grey-container.png";
import { HomeGlyph, PinIcon, ClockIcon, VoteUpIcon, CommentIcon, EyeIcon, EditPenIcon, TrashIcon, ShieldIcon, UserGlyph } from "../components/icons";

const STATUS_BG = { 'In progress': 'bg-[#B87613]', 'Resolved': 'bg-nagorik-green' };

function ReportRow({ issue, expanded, onView, onGoToPost, onEdit, onDelete }) {
  const badgeBg = STATUS_BG[issue.statusLabel] || 'bg-nagorik-red';
  const details = [
    ['Category', issue.category], ['Priority', issue.priority],
    ['Description', issue.description], ['Full Address', issue.address]
  ];

  return (
    <article className="flex items-center gap-[18px] rounded-2xl border border-nagorik-light-red bg-[linear-gradient(90deg,var(--color-nagorik-soft-red),var(--color-nagorik-paper)_62%)] p-3.5 max-[760px]:flex-col max-[760px]:items-stretch">
      <div className="h-[118px] w-[118px] shrink-0 overflow-hidden rounded-xl bg-nagorik-surface-2">
        <img
          src={issue.img}
          alt={issue.title}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
        <div className="flex flex-wrap items-center gap-2.5">
          {issue.activityBadge && (
            <span className="inline-flex items-center rounded-md bg-nagorik-red/10 px-2 py-0.5 text-[10.5px] font-extrabold text-nagorik-red dark:bg-nagorik-red/20 dark:text-[#FF7080]">{issue.activityBadge}</span>
          )}
          <h3 className="m-0 text-[15px] font-extrabold text-nagorik-heading">{issue.title}</h3>
          <span className={`inline-flex items-center gap-[5px] rounded-full px-[11px] py-1 text-[10.5px] font-bold text-white ${badgeBg}`}>
            <span className="h-[5px] w-[5px] rounded-full bg-white" />{issue.statusLabel || "Open"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-[12px] text-nagorik-secondary">
          <span className="flex items-center gap-[5px]"><PinIcon size={12} />{issue.area}</span>
          <span className="flex items-center gap-[5px]"><ClockIcon size={12} />{issue.time}</span>
        </div>
        <div className="flex items-center gap-3.5 text-[11.5px] font-bold text-nagorik-red dark:text-[#FF7080]">
          <span className="flex items-center gap-1"><VoteUpIcon size={12} />{issue.up} upvotes</span>
          <span className="flex items-center gap-1"><CommentIcon size={12} />{issue.comments} comments</span>
        </div>
        <div className="mt-[3px] flex flex-wrap gap-2">
          <button type="button" className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11.5px] font-bold cursor-pointer whitespace-nowrap transition-colors duration-150 ${expanded ? 'border-[1.5px] border-nagorik-red bg-transparent text-nagorik-red px-[12.5px] py-[6.5px]' : 'bg-nagorik-red text-white hover:bg-nagorik-hover-red'}`} onClick={() => onView(issue.id)}>
            <EyeIcon />{expanded ? "Hide Details" : "View Details"}
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white" onClick={() => onGoToPost(issue.id)}>Go to Post</button>
          {issue.canEdit && (
            <button type="button" className="flex items-center gap-1.5 rounded-full border-[1.5px] border-nagorik-red bg-transparent px-[12.5px] py-[6.5px] text-[11.5px] font-bold text-nagorik-red cursor-pointer whitespace-nowrap transition-colors duration-150 hover:bg-nagorik-red hover:text-white" onClick={() => onEdit(issue.id)}>
              <EditPenIcon size={12} />Edit
            </button>
          )}
        </div>
        {expanded && (
          <div className="mt-3 border-t border-nagorik-border pt-1">
            {details.map(([label, val]) => (
              <div key={label} className="flex gap-[24px] border-b border-nagorik-cream py-3 text-[13.5px]">
                <span className="w-[190px] shrink-0 font-semibold text-nagorik-muted">{label}</span>
                <span className="break-words font-bold text-nagorik-heading">{val || "—"}</span>
              </div>
            ))}
            {issue.canEdit && (
              <div className="mt-4 flex justify-end pt-1">
                <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-[12px] font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:border-red-800 dark:bg-red-950/30 dark:text-red-400" onClick={() => onDelete(issue.id)}>
                  <TrashIcon />Delete Issue
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [activeContribution, setActiveContribution] = useState("recent");
  const [activeStatus, setActiveStatus] = useState("All");
  const [reports, setReports] = useState(() => getMyReports());
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const upvotedIssues = getUpvotedIssues();
  const userData = getUser();
  const displayName = userData.name || "Nagorik User";

  useEffect(() => {
    document.title = "Profile — नागरिक";
    document.documentElement.lang = "bn";
  }, []);

  const confirmDelete = () => {
    if (!deletingId) return;
    setReports(deleteReport(deletingId));
    if (expandedId === deletingId) setExpandedId(null);
    setDeletingId(null);
  };

  const format = (list, badge, canEdit = false, prefix = "") =>
    list.map((r) => ({ ...r, id: prefix ? `${prefix}-${r.id}` : r.id, activityBadge: badge, canEdit, statusLabel: r.statusLabel || "Open" }));

  const getDisplayedItems = () => {
    const categories = {
      recent: [...format(reports, "Reported by you", true), ...format(upvotedIssues, "Upvoted by you"), ...format(reports.slice(0, 1), "Commented by you", false, "comment")],
      reported: format(reports, "Reported by you", true),
      upvoted: format(upvotedIssues, "Upvoted by you"),
      commented: format(reports.slice(0, 2), "Commented by you"),
      resolved: format(reports.filter((r) => r.statusLabel === "Resolved"), "Resolved", true),
    };
    const items = categories[activeContribution] || [];
    return activeStatus === "All" ? items : items.filter((i) => i.statusLabel === activeStatus);
  };

  const displayedItems = getDisplayedItems();
  const resolvedCount = reports.filter((r) => r.statusLabel === "Resolved").length;

  const HEADINGS = {
    recent: "Recent Activity Highlights",
    reported: "Issues Reported by You",
    upvoted: "Issues You Upvoted",
    commented: "Issues You Commented On",
    resolved: "Resolved Issues",
  };

  const contributionCards = [
    { key: 'reported', label: 'Issues Reported', icon: <EditPenIcon size={17} />, count: reports.length },
    { key: 'upvoted', label: 'Upvote', icon: <VoteUpIcon size={17} />, count: upvotedIssues.length },
    { key: 'commented', label: 'Comments made', icon: <CommentIcon size={17} />, count: 123 },
    { key: 'resolved', label: 'Issues resolved', icon: <ShieldIcon size={17} />, count: resolvedCount },
  ];

  return (
    <>
      <AppHeader logoHref="/" navItems={[{ label: "HOME", variant: "inactive", to: "/browse_feed", icon: <HomeGlyph /> }]} />

      <div className="mx-auto max-w-[1160px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        <section className="relative isolate z-0 flex flex-col overflow-hidden rounded-[18px] p-[30px_32px_26px]" style={{ backgroundImage: `url(${profileBg}), linear-gradient(135deg, #d5d5d3, #c4c4c2)`, backgroundSize: 'cover, cover', backgroundPosition: 'center, center' }}>
          <div className="flex items-start justify-between gap-4 max-[760px]:flex-col max-[760px]:items-stretch">
            <div className="flex items-center gap-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
              <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white text-nagorik-red shadow-[0_6px_16px_-8px_rgba(0,0,0,0.35)] dark:border-nagorik-border dark:bg-nagorik-surface-2">
                {userData?.avatar || userData?.image ? (
                  <img src={userData.avatar || userData.image} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-nagorik-soft-red/40 text-nagorik-red dark:bg-nagorik-red/20 dark:text-[#FF7080]">
                    <UserGlyph size={42} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="mb-1 text-[22px] font-extrabold text-nagorik-red">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#a8525c] dark:text-[#D98A93]">
                  <ClockIcon size={13} /> Joined Date: 04 Nov, 2024
                </span>
              </div>
            </div>
            <button type="button" className="flex items-center gap-[7px] self-start rounded-full bg-nagorik-red px-5 py-[11px] text-[12.5px] font-bold tracking-[0.5px] text-white transition-all duration-150 hover:-translate-y-px hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)] cursor-pointer max-[760px]:justify-center" onClick={() => navigate("/edit_profile")}>
              <EditPenIcon size={13} /> EDIT PROFILE
            </button>
          </div>

          <div className="mt-auto pt-6">
            <h2 className="mb-3 text-[15px] font-extrabold text-[#26261f] dark:text-nagorik-heading">Contributions</h2>
            <div className="grid grid-cols-4 gap-[18px] max-[760px]:grid-cols-2">
              {contributionCards.map((card) => (
                <button type="button" key={card.key} onClick={() => setActiveContribution(activeContribution === card.key ? 'recent' : card.key)} className={`flex min-h-[98px] flex-col rounded-[10px] bg-white p-[13px_18px_14px] text-left transition-all duration-150 cursor-pointer shadow-[0_6px_14px_-10px_rgba(0,0,0,0.3)] dark:bg-nagorik-surface ${activeContribution === card.key ? 'ring-2 ring-nagorik-red border-transparent' : 'border border-transparent hover:border-nagorik-light-red'}`}>
                  <span className="text-[12px] font-semibold text-[#a3a39e]">{card.label}</span>
                  <span className="mt-auto flex items-center gap-2.5 pt-2.5 text-nagorik-red">
                    {card.icon}
                    <span className="text-[28px] font-extrabold leading-none text-[#111110] dark:text-nagorik-heading">
                      {card.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-2.5 pt-[26px]">
          {['All', 'In progress', 'Open', 'Resolved'].map((status) => (
            <button key={status} type="button" className={`rounded-full border px-[22px] py-[9px] text-[13px] font-bold transition-all duration-150 cursor-pointer ${activeStatus === status ? 'border-nagorik-red bg-nagorik-red text-white' : 'border-nagorik-border bg-nagorik-paper text-nagorik-red hover:bg-nagorik-light-red dark:text-[#FF7080]'}`} onClick={() => setActiveStatus(status)}>
              {status}
            </button>
          ))}
        </div>

        <div className="mt-[26px]">
          <div className="mb-3.5 flex items-center justify-between">
            <h2 className="m-0 text-[17px] font-extrabold text-nagorik-heading capitalize">{HEADINGS[activeContribution]}</h2>
            <span className="text-[13px] text-nagorik-muted">{displayedItems.length} total</span>
          </div>

          <div className="flex flex-col gap-5">
            {displayedItems.length ? (
              displayedItems.map((issue) => (
                <ReportRow key={issue.id} issue={issue} expanded={expandedId === issue.id} onView={(id) => setExpandedId(prev => prev === id ? null : id)} onGoToPost={(id) => navigate(`/post/${String(id).replace('comment-', '')}`)} onEdit={(id) => navigate("/report", { state: { editId: id } })} onDelete={setDeletingId} />
              ))
            ) : (
              <p className="py-12 text-center text-[14px] text-nagorik-muted">No activity found for this section.</p>
            )}
          </div>
        </div>
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-nagorik-surface">
            <h3 className="text-[18px] font-bold text-nagorik-heading">Delete Report?</h3>
            <p className="mt-2 text-[13.5px] text-nagorik-muted">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingId(null)} className="rounded-full border border-nagorik-border px-4 py-2 text-[12.5px] font-bold text-nagorik-secondary hover:bg-gray-100 dark:hover:bg-nagorik-surface-2 cursor-pointer">Cancel</button>
              <button type="button" onClick={confirmDelete} className="rounded-full bg-red-600 px-4 py-2 text-[12.5px] font-bold text-white hover:bg-red-700 cursor-pointer">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}