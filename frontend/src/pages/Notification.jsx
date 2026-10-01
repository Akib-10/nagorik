import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import {
  VoteUpIcon,
  CommentIcon,
  PinIcon,
  CheckIcon,
} from "../components/icons";
import { useNotifications } from "../hooks/useNotifications";
import {
  loadMore,
  markAllAsRead,
  removeNotification,
  retry,
  selectFilter,
  toggleRead,
} from "../services/notificationStore";

const PAGE_SIZE = 20;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "status", label: "Updates" },
  { key: "activity", label: "Activity" },
];

const ICONS = {
  upvote: <VoteUpIcon size={16} />,
  comment: <CommentIcon size={16} />,
  status: <PinIcon size={16} />,
  default: <CheckIcon size={16} />,
};

export default function Notification() {
  const navigate = useNavigate();
  const {
    items: notifications,
    unreadCount,
    totalPages,
    loading,
    loadingMore,
    error,
    filter,
  } = useNotifications();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleItemClick = (item) => {
    if (!item.read) toggleRead(item.id);
    if (item.targetUrl) navigate(item.targetUrl);
  };

  const handleToggleRead = (id, e) => {
    e?.stopPropagation();
    toggleRead(id);
    setOpenMenuId(null);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    removeNotification(id);
    setConfirmDeleteId(null);
    setOpenMenuId(null);
  };

  const hasMore = notifications.length < totalPages * PAGE_SIZE;

  const renderBody = () => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
          <p className="text-[14px] font-semibold text-nagorik-muted">
            Loading notifications...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
          <p className="text-[14px] font-semibold text-nagorik-red">{error}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 cursor-pointer rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-1.5 text-[12px] font-bold text-nagorik-secondary transition-colors hover:bg-nagorik-border"
          >
            Try again
          </button>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="rounded-2xl border border-nagorik-border bg-nagorik-surface-2/40 py-12 text-center">
          <p className="text-[14px] font-semibold text-nagorik-muted">
            No notifications found in this view.
          </p>
        </div>
      );
    }

    return notifications.map((item) => (
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
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-nagorik-muted transition-colors hover:bg-nagorik-border hover:text-nagorik-heading"
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
                onClick={(e) => handleToggleRead(item.id, e)}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-nagorik-heading hover:bg-nagorik-surface-2"
              >
                <span>{item.read ? "Mark as unread" : "Mark as read"}</span>
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
                      className="flex-1 cursor-pointer rounded-md bg-nagorik-red py-1 text-center text-[12px] font-bold text-white hover:bg-nagorik-hover-red"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 cursor-pointer rounded-md bg-nagorik-border py-1 text-center text-[12px] font-bold text-nagorik-heading"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(item.id)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-nagorik-red hover:bg-nagorik-red/10"
                >
                  <span>Delete notification</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <>
      <AppHeader logoHref="/" />

      <main className="mx-auto max-w-[860px] px-7 pt-7 pb-[60px] max-[760px]:px-4">
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

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={!unreadCount || loading}
            className="cursor-pointer rounded-full border border-nagorik-border bg-nagorik-surface-2 px-3.5 py-1.5 text-[12px] font-bold text-nagorik-secondary transition-colors hover:bg-nagorik-border disabled:opacity-50"
          >
            Mark all as read
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectFilter(tab.key)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-bold transition-colors ${filter === tab.key ? "bg-nagorik-red text-white" : "bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-border"}`}
            >
              {tab.key === "unread" ? `Unread (${unreadCount})` : tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {renderBody()}

          {!loading && !error && notifications.length > 0 && hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="mt-2 cursor-pointer rounded-full border border-nagorik-border bg-nagorik-surface-2 py-2 text-[13px] font-bold text-nagorik-secondary transition-colors hover:bg-nagorik-border disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      </main>
    </>
  );
}