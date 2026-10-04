import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import logo from "../assets/images/logo_for_dark_mode.png";
import { isAuthenticated, getUser, signOut } from "../services/authService";
import {
  getAdminSection,
  subscribeAdminSection,
} from "../services/adminSectionStore";
import { BellIconApp } from "./icons";
import IssueSearchBox from "./IssueSearchBox";
import { useUnreadCount } from "../hooks/useUnreadCount";

export default function AppHeader({ logoHref = "/" }) {
  const isAuth = isAuthenticated();
  const userData = getUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const unreadCount = useUnreadCount(isAuth);
  const [adminSection, setAdminSection] = useState(getAdminSection);

useEffect(() => subscribeAdminSection(setAdminSection), []);

  // Badge text: the exact number for 1-5, just "+" for anything above that.
  const badgeText = unreadCount > 5 ? "5+" : String(unreadCount);

  // Ring the bell whenever the count goes UP (a new comment/upvote arrived).
  // Comparing during render is React's recommended alternative to an effect
  // that sets state from a previous value.
  const [prevUnread, setPrevUnread] = useState(unreadCount);
  const [ringKey, setRingKey] = useState(0);
  if (unreadCount !== prevUnread) {
    setPrevUnread(unreadCount);
    if (unreadCount > prevUnread) setRingKey((k) => k + 1);
  }

  // The logo is "home": admins land back in the admin page they came from
  // (same tab / page / search), everyone else in the browse feed, signed-out
  // visitors on logoHref.
  const logoTarget = isAuth
    ? userData.isAdmin
      ? adminSection
      : "/browse-feed"
    : logoHref;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuToggleRef = useRef(null);

  // Close the profile dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (
        menuRef.current &&
        menuToggleRef.current &&
        !menuRef.current.contains(e.target) &&
        !menuToggleRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // Enter, or picking a suggestion, opens the feed filtered by that text.
  const handleSearchSubmit = (text) => {
    navigate(`/browse-feed?q=${encodeURIComponent(text)}`);
  };

  const handleBellClick = () => {
    if (pathname === "/notifications") {
      navigate(-1);
    } else {
      navigate("/notifications");
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    signOut();
    navigate("/", { replace: true });
  };

  // The feed carries its own search field, so the header's search bar is
  // dropped there rather than duplicated; every other page keeps it.
  const hideSearchBar = pathname === "/browse-feed";

  const bellBtnClass = clsx(
    "relative",
    "flex",
    "h-[38px]",
    "w-[38px]",
    "shrink-0",
    "items-center",
    "justify-center",
    "rounded-full",
    "transition-colors",
    "duration-150",
    "cursor-pointer",
    "max-[420px]:h-[34px]",
    "max-[420px]:w-[34px]",
    pathname === "/notifications"
      ? ["bg-nagorik-red", "text-white"]
      : unreadCount > 0
        ? ["bg-nagorik-light-red", "text-nagorik-red", "hover:bg-nagorik-red", "hover:text-white"]
        : ["bg-transparent", "text-nagorik-red", "hover:bg-nagorik-red", "hover:text-white"],
  );

  return (
    <header
      className={clsx(
        "sticky",
        "top-0",
        "z-50",
        "border-b",
        "border-nagorik-line",
        "bg-nagorik-cream/86",
        "backdrop-blur-[10px]",
      )}
    >
      <div
        className={clsx(
          "mx-auto",
          "flex",
          "max-w-[1160px]",
          "flex-wrap",
          "items-center",
          "gap-5",
          "px-7",
          "py-[14px]",
          "min-[761px]:grid",
          "min-[761px]:grid-cols-[1fr_minmax(0,1fr)_1fr]",
          "min-[761px]:flex-nowrap",
          "max-[760px]:gap-[10px]",
          "max-[760px]:px-4",
          "max-[760px]:py-3",
        )}
      >
        {/* Left Logo properties */}
        <div
          className={clsx(
            "flex",
            "min-w-0",
            "items-center",
            "gap-5",
            "max-[760px]:shrink-0",
          )}
        >
          <Link
            to={logoTarget}
            className={clsx("flex", "shrink-0", "items-center")}
            aria-label="নাগরিক home"
          >
            <img src={logo} alt="নাগরিক" className="h-[50px] w-auto" />
          </Link>
        </div>

        {/* Center search bar: same suggestion dropdown as the admin panel's
            Manage Issues search. */}
        {!hideSearchBar && (
          <IssueSearchBox
            variant="header"
            placeholder="SEARCH CIVIC ISSUES"
            onSubmit={handleSearchSubmit}
            className={clsx(
              "order-3",
              "flex-1",
              "max-w-[400px]",
              "min-[761px]:order-none",
              "min-[761px]:w-full",
              "min-[761px]:justify-self-center",
              "max-[760px]:order-3",
              "max-[760px]:max-w-full",
              "max-[760px]:basis-full",
            )}
          />
        )}

        {/* Right side: Report/Sign up + Notification + Profile */}
        <div
          className={clsx(
            "ml-auto",
            "flex",
            "items-center",
            "gap-4",
            "min-[761px]:ml-0",
            "min-[761px]:justify-self-end",
            // Pinned to the last column so hiding the search bar on the feed
            // cannot pull this group into the middle column and shift it left.
            "min-[761px]:col-start-3",
            "max-[760px]:gap-2.5",
            "max-[420px]:gap-2",
          )}
        >
          {isAuth ? (
            <Link
              to="/report"
              className={clsx(
                "flex",
                "shrink-0",
                "items-center",
                "gap-2",
                "whitespace-nowrap",
                "rounded-full",
                "bg-nagorik-surface-2",
                "px-[22px]",
                "py-[11px]",
                "text-[14px]",
                "font-bold",
                "text-nagorik-secondary",
                "transition-colors",
                "duration-150",
                "hover:bg-nagorik-red",
                "hover:!text-white",
                "max-[760px]:px-3.5",
              )}
            >
            
              <span className="max-[760px]:hidden">REPORT ISSUE</span>
            </Link>
          ) : (
            <Link
              to="/login"
              state={{ mode: "login", from: "/report" }}
              className={clsx(
                "flex",
                "shrink-0",
                "items-center",
                "gap-2",
                "whitespace-nowrap",
                "rounded-full",
                "bg-transparent",
                "border-2",
                "border-nagorik-red",
                "px-[22px]",
                "py-[11px]",
                "text-[14px]",
                "font-bold",
                "!text-nagorik-red",
                "transition-colors",
                "duration-150",
                "hover:bg-nagorik-red",
                "hover:!text-white",
                "max-[760px]:px-3.5",
              )}
            >
              <span className="max-[760px]:hidden">Sign In</span>
            </Link>
          )}

          {isAuth && (
            <button
              type="button"
              onClick={handleBellClick}
              className={bellBtnClass}
              aria-label={
                unreadCount > 0
                  ? `Notifications, ${unreadCount} unread`
                  : "Notifications"
              }
            >
              <span
                key={ringKey}
                className={clsx("flex", ringKey > 0 && "bell-ring")}
              >
                <BellIconApp />
              </span>
              {unreadCount > 0 && (
                <span
                  key={badgeText}
                  className="badge-pop absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-nagorik-cream bg-nagorik-red px-1 text-[10px] font-bold leading-none text-white"
                >
                  {badgeText}
                </span>
              )}
            </button>
          )}

          {/* Profile icon + dropdown */}
          {isAuth && (
            <div className="relative">
              <button
                ref={menuToggleRef}
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className={clsx(
                  "flex",
                  "h-[38px]",
                  "w-[38px]",
                  "shrink-0",
                  "items-center",
                  "justify-center",
                  "overflow-hidden",
                  "rounded-full",
                  "border-2",
                  "border-nagorik-red",
                  "bg-nagorik-surface-2",
                  "max-[420px]:h-[34px]",
                  "max-[420px]:w-[34px]",
                )}
                aria-label="Open profile menu"
                aria-expanded={menuOpen}
              >
                {userData.name ? (
                  <span
                    className={clsx(
                      "text-[14px]",
                      "font-bold",
                      "text-nagorik-red",
                    )}
                  >
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg viewBox="0 0 24 24" fill="var(--color-nagorik-muted)">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                )}
              </button>

              {menuOpen && (
                <ul
                  ref={menuRef}
                  className={clsx(
                    "absolute",
                    "right-0",
                    "top-[46px]",
                    "z-20",
                    "w-48",
                    "rounded-xl",
                    "border",
                    "border-nagorik-border",
                    "bg-nagorik-paper",
                    "p-1.5",
                    "shadow-lg",
                  )}
                >
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/user");
                      }}
                      className={clsx(
                        "flex",
                        "w-full",
                        "items-center",
                        "rounded-lg",
                        "px-3",
                        "py-2",
                        "text-left",
                        "text-[13px]",
                        "font-semibold",
                        "text-nagorik-heading",
                        "hover:bg-nagorik-surface-2",
                        "cursor-pointer",
                      )}
                    >
                      View Profile
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate("/settings");
                      }}
                      className={clsx(
                        "flex",
                        "w-full",
                        "items-center",
                        "rounded-lg",
                        "px-3",
                        "py-2",
                        "text-left",
                        "text-[13px]",
                        "font-semibold",
                        "text-nagorik-heading",
                        "hover:bg-nagorik-surface-2",
                        "cursor-pointer",
                      )}
                    >
                      Settings
                    </button>
                  </li>
                  {userData.isAdmin && (
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/admin");
                        }}
                        className={clsx(
                          "flex",
                          "w-full",
                          "items-center",
                          "rounded-lg",
                          "px-3",
                          "py-2",
                          "text-left",
                          "text-[13px]",
                          "font-semibold",
                          "text-nagorik-heading",
                          "hover:bg-nagorik-surface-2",
                          "cursor-pointer",
                        )}
                      >
                        Admin Panel
                      </button>
                    </li>
                  )}
                  <li
                    className={clsx(
                      "mt-1",
                      "border-t",
                      "border-nagorik-border",
                      "pt-1",
                    )}
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className={clsx(
                        "flex",
                        "w-full",
                        "items-center",
                        "rounded-lg",
                        "px-3",
                        "py-2",
                        "text-left",
                        "text-[13px]",
                        "font-semibold",
                        "text-nagorik-red",
                        "hover:bg-nagorik-red/10",
                        "cursor-pointer",
                      )}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}