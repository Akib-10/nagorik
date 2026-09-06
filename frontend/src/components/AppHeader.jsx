import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import clsx from "clsx";
import logo from "../assets/images/logo_for_dark_mode.png";
import { isAuthenticated, getUser, signOut } from "../services/authService";
import { SearchIcon, PlusIcon, BellIconApp } from "./icons";

export default function AppHeader({ logoHref = "/" }) {
  const isAuth = isAuthenticated();
  const userData = getUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

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

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      navigate(
        `/browse_feed?q=${encodeURIComponent(e.currentTarget.value.trim())}`,
      );
    }
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
    navigate("/");
  };

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
      ? ["bg-nagorik-red", 
        "text-white"]
      : ["bg-transparent", 
        "text-nagorik-red", 
        "hover:bg-nagorik-light-red", 
        "!hover:text-white"],
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
            to={logoHref}
            className={clsx("flex", "shrink-0", "items-center")}
            aria-label="নাগরিক home"
          >
            <img src={logo} alt="নাগরিক" className="h-[50px] w-auto" />
          </Link>
        </div>

        {/* Center search bar properties */}
        <div
          className={clsx(
            "order-3",
            "flex",
            "flex-1",
            "items-center",
            "gap-2.5",
            "rounded-full",
            "border",
            "border-nagorik-border",
            "bg-nagorik-surface-2",
            "px-4",
            "py-[9px]",
            "text-[13px]",
            "text-nagorik-muted",
            "max-w-[400px]",
            "min-[761px]:order-none",
            "min-[761px]:w-full",
            "min-[761px]:justify-self-center",
            "max-[760px]:order-3",
            "max-[760px]:max-w-full",
            "max-[760px]:basis-full",
          )}
        >
          <SearchIcon size={16} />
          <div className={clsx("h-4", "w-px", "bg-nagorik-border")}></div>
          <input
            type="text"
            placeholder="SEARCH CIVIC ISSUES"
            onKeyDown={handleSearchKey}
            className={clsx(
              "w-full",
              "border-0",
              "bg-transparent",
              "text-[14px]",
              "text-nagorik-body-text",
              "font-[inherit]",
              "outline-none",
            )}
          />
        </div>

        {/* Right side: Report/Sign up + Notification + Profile */}
        <div
          className={clsx(
            "ml-auto",
            "flex",
            "items-center",
            "gap-4",
            "min-[761px]:ml-0",
            "min-[761px]:justify-self-end",
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
              state={{ mode: "register", from: "/report" }}
              className={clsx(
                "flex",
                "shrink-0",
                "items-center",
                "gap-2",
                "whitespace-nowrap",
                "rounded-full",
                "bg-nagorik-red",
                "px-[22px]",
                "py-[11px]",
                "text-[14px]",
                "font-bold",
                "!text-white",
                "transition-colors",
                "duration-150",
                "hover:bg-nagorik-hover-red",
                "max-[760px]:px-3.5",
              )}
            >
           
              <span className="max-[760px]:hidden">SIGN UP</span>
            </Link>
          )}

          {isAuth && (
            <button
              type="button"
              onClick={handleBellClick}
              className={bellBtnClass}
              aria-label="Toggle notifications"
            >
              <BellIconApp />
              {pathname !== "/notifications" && (
                <span
                  className={clsx(
                    "absolute",
                    "top-1.5",
                    "right-1.5",
                    "h-2",
                    "w-2",
                    "rounded-full",
                    "bg-nagorik-red",
                  )}
                />
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