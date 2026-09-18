import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import {
  HomeGlyph,
  VoteUpIcon,
  CommentIcon,
  PinIcon,
  CheckIcon,
} from "../components/icons";

// Adjust this if your API base or token storage differs.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  const units = [
    ["y", 31536000],
    ["mo", 2592000],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ];
  for (const [label, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val}${label} ago`;
  }
  return "just now";
}

const ICONS = {
  upvote: <VoteUpIcon size={16} />,
  comment: <CommentIcon size={16} />,
  status: <PinIcon size={16} />,
  default: <CheckIcon size={16} />,
};

export default function Notification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchNotifications() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/notifications?filter=all&limit=100`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to load notifications");
        const data = await res.json();
        if (!cancelled) {
          setNotifications(
            data.items.map((n) => ({
              id: n._id,
              type: n.type,
              title: n.title,
              message: n.message,
              time: timeAgo(n.createdAt),
              read: n.read,
              targetUrl:
                n.targetType === "Issue"
                  ? `/post/${n.targetId}`
                  : n.targetType === "Comment"
                  ? `/post/${n.targetId}`
                  : null,
            }))
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleRead = async (id, e) => {
    e?.stopPropagation();
    const target = notifications.find((n) => n.id === id);
    if (!target) return;
    const nextRead = !target.read;

    // optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: nextRead } : n))
    );
    setOpenMenuId(null);

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ read: nextRead }),
      });
      if (!res.ok) throw new Error("Failed to update read state");
    } catch (err) {
      console.error(err);
      // revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: !nextRead } : n))
      );
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const prevState = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setConfirmDeleteId(null);
    setOpenMenuId(null);

    try {
      const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete notification");
    } catch (err) {
      console.error(err);
      setNotifications(prevState); // revert on failure
    }
  };

  const markAllAsRead = async () => {
    const prevState = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
    } catch (err) {
      console.error(err);
      setNotifications(prevState); // revert on failure
    }
  };

  const handleItemClick = (item) => {
    if (!item.read) toggleRead(item.id);
    if (item.targetUrl) navigate(item.targetUrl);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "status") return n.type === "status";
    if (filter === "activity")
      return n.type === "upvote" || n.type === "comment";
    return true;
  });

  return (
    <>
      <AppHeader
        logoHref="/"
        navItems={[
          { label: "BROWSE FEED", href: "/browse_feed", icon: <HomeGlyph /> },
        ]}
        showIconButtons
      />

      <main className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
        {/* HEADER BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-nagorik-border pb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-[28px] font-extrabold text-nagorik-heading max-[760px]:text-[22px]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-nagorik-red px-2.5 py-0.5 text-[12px] font-bold text-white">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount}
              className="rounded-full border border-nagorik-border bg-nagorik-surface-2 px-3.5 py-1.5 text-[12px] font-bold text-nagorik-secondary transition-colors hover:bg-nagorik-border disabled:opacity-50 cursor-pointer"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: `Unread (${unreadCount})` },
            { key: "status", label: "Updates" },
            { key: "activity", label: "Activity" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors cursor-pointer ${filter === tab.key ? "bg-nagorik-red text-white" : "bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-border"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* NOTIFICATION CARDS */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
              <p className="text-[14px] font-semibold text-nagorik-muted">
                Loading notifications...
              </p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`group relative flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition-all ${item.read ? "border-nagorik-border bg-nagorik-surface-2/60" : "border-nagorik-red/30 bg-nagorik-soft-red/30"}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-nagorik-soft-red text-nagorik-red">
                    {ICONS[item.type] || ICONS.default}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[14px] font-bold text-nagorik-heading">
                        {item.title}
                      </h2>
                      {!item.read && (
                        <span className="h-2 w-2 rounded-full bg-nagorik-red" />
                      )}
                    </div>
                    <p className="mt-0.5 text-[13px] leading-[1.5] text-nagorik-body-text">
                      {item.message}
                    </p>
                    <span className="mt-1.5 block text-[12px] font-medium text-nagorik-muted">
                      {item.time}
                    </span>
                  </div>
                </div>

                {/* OPTIONS DROPDOWN */}
                <div
                  className="relative shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    title="More options"
                    onClick={() => {
                      setOpenMenuId(openMenuId === item.id ? null : item.id);
                      setConfirmDeleteId(null);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-nagorik-muted transition-colors hover:bg-nagorik-border hover:text-nagorik-heading cursor-pointer"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </button>

                  {openMenuId === item.id && (
                    <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-nagorik-border bg-nagorik-paper p-1.5 shadow-lg">
                      <button
                        type="button"
                        onClick={(e) => toggleRead(item.id, e)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-nagorik-heading hover:bg-nagorik-surface-2 cursor-pointer"
                      >
                        <span>
                          {item.read ? "Mark as unread" : "Mark as read"}
                        </span>
                      </button>
                      {confirmDeleteId === item.id ? (
                        <div className="mt-1 border-t border-nagorik-border pt-1.5">
                          <p className="px-3 py-1 text-[11px] font-bold text-nagorik-red">
                            Confirm deletion?
                          </p>
                          <div className="flex gap-1 px-1">
                            <button
                              type="button"
                              onClick={(e) => handleDelete(item.id, e)}
                              className="flex-1 rounded-md bg-nagorik-red py-1 text-center text-[12px] font-bold text-white hover:bg-nagorik-hover-red cursor-pointer"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex-1 rounded-md bg-nagorik-border py-1 text-center text-[12px] font-bold text-nagorik-heading cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-nagorik-red hover:bg-nagorik-red/10 cursor-pointer"
                        >
                          <span>Delete notification</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
              <p className="text-[14px] font-semibold text-nagorik-muted">
                No notifications found in this view.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}