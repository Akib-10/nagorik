import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/images/logo_for_dark_mode.png";
import { isAuthenticated, getUser } from "../services/authService";
import { SearchIcon, PlusIcon, BellIconApp, HomeGlyph } from "./icons";

export default function AppHeader({
  logoHref = "/",
  navItems = [],
  showIconButtons = false,
}) {
  const isAuth = isAuthenticated();
  const userData = getUser();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const visibleNavItems = navItems.filter((item) => {
    const itemPath = item.to ?? item.href ?? "";
    if (pathname === "/user" || pathname === "/report" || pathname === "/settings" || pathname === "/notifications") return false;
    return !(itemPath === "/" ? pathname === itemPath : pathname.startsWith(itemPath));
  });

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      navigate(
        `/browse_feed?q=${encodeURIComponent(e.currentTarget.value.trim())}`,
      );
    }
  };

  const handleBellClick = () => {
    if (pathname === "/notifications") {
      navigate(-1); // Jump out back to previous page
    } else {
      navigate("/notifications"); // Jump in
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-nagorik-red/[0.08] bg-white/62 backdrop-blur-[16px] saturate-[170%] shadow-[0_4px_24px_rgba(28,37,43,0.05)] dark:border-white/[0.06] dark:bg-[rgba(22,16,16,0.72)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-5 px-7 py-[14px] min-[761px]:grid min-[761px]:grid-cols-[1fr_minmax(0,1fr)_1fr] min-[761px]:flex-nowrap max-[760px]:gap-[10px] max-[760px]:px-4 max-[760px]:py-3">
        <div className="flex min-w-0 items-center gap-5 max-[760px]:shrink-0">
          <Link to={logoHref} className="flex shrink-0 items-center" aria-label="নাগরিক home">
            <img src={logo} alt="নাগরিক" className="h-[50px] w-auto" />
          </Link>

          {visibleNavItems.map((item) => {
            const base = "flex items-center gap-2 rounded-full px-5 py-[10px] text-[14px] font-bold whitespace-nowrap";
            const cls = item.variant === "active"
              ? `${base} bg-nagorik-red text-white`
              : item.variant === "inactive"
                ? `${base} bg-nagorik-surface-2 text-nagorik-secondary hover:bg-nagorik-border`
                : base;
            if (item.to) {
              return (
                <Link key={item.label} to={item.to} className={cls}>
                  {item.icon}
                  <span className="label max-[760px]:hidden">{item.label}</span>
                </Link>
              );
            }
            return (
              <button key={item.label} type="button" className={cls}>
                {item.icon}
                <span className="label max-[760px]:hidden">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="order-3 flex flex-1 items-center gap-2.5 rounded-full border border-nagorik-border bg-nagorik-surface-2 px-4 py-[9px] text-[13px] text-nagorik-muted max-w-[400px] min-[761px]:order-none min-[761px]:w-full min-[761px]:justify-self-center max-[760px]:order-3 max-[760px]:max-w-full max-[760px]:basis-full">
          <SearchIcon size={16} />
          <div className="h-4 w-px bg-nagorik-border"></div>
          <input
            type="text"
            placeholder="SEARCH CIVIC ISSUES"
            onKeyDown={handleSearchKey}
            className="w-full border-0 bg-transparent text-[14px] text-nagorik-body-text font-[inherit] outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-4 min-[761px]:ml-0 min-[761px]:justify-self-end max-[760px]:gap-2.5 max-[420px]:gap-2">
          {(pathname === "/settings" || pathname === "/notifications") && (
            <Link
              to="/browse_feed"
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-nagorik-surface-2 px-5 py-[10px] text-[14px] font-bold text-nagorik-secondary transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
            >
              <HomeGlyph />
              <span>HOME</span>
            </Link>
          )}
          {isAuth ? (
            pathname === "/report" ? (
              <Link
                to="/browse_feed"
                className="ml-4 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-nagorik-surface-2 px-5 py-[10px] text-[14px] font-bold text-nagorik-secondary transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
              >
                <HomeGlyph />
                <span>HOME</span>
              </Link>
            ) : (
              <Link to="/report" className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-nagorik-surface-2 px-[22px] py-[11px] text-[14px] font-bold text-nagorik-secondary transition-colors duration-150 hover:bg-nagorik-red hover:text-white max-[760px]:px-3.5">
                <PlusIcon />
                <span className="label max-[760px]:hidden">REPORT ISSUE</span>
              </Link>
            )
          ) : (
            <Link
              to="/login"
              state={{ mode: "register", from: "/report" }}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-nagorik-red px-[22px] py-[11px] text-[14px] font-bold text-white transition-colors duration-150 hover:bg-nagorik-hover-red max-[760px]:px-3.5"
            >
              <PlusIcon />
              <span className="label max-[760px]:hidden">SIGN UP</span>
            </Link>
          )}
          {showIconButtons && pathname !== "/report" && (
            <button
              type="button"
              onClick={handleBellClick}
              className={`relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full transition-colors duration-150 cursor-pointer max-[420px]:h-[34px] max-[420px]:w-[34px] ${
                pathname === "/notifications"
                  ? "bg-nagorik-red text-white"
                  : "bg-transparent text-nagorik-red hover:bg-nagorik-light-red"
              }`}
              aria-label="Toggle notifications"
            >
              <BellIconApp />
              {pathname !== "/notifications" && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#C8102E]" />
              )}
            </button>
          )}
          {pathname === "/user" ? (
            <Link
              to="/browse_feed"
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-nagorik-surface-2 px-5 py-[10px] text-[14px] font-bold text-nagorik-secondary transition-colors duration-150 hover:bg-nagorik-red hover:text-white"
            >
              <HomeGlyph />
              <span>HOME</span>
            </Link>
          ) : (
            <Link to="/user" className="flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-nagorik-red bg-nagorik-surface-2 max-[420px]:h-[34px] max-[420px]:w-[34px]" aria-label="My profile">
              {isAuth && userData.name ? (
                <span className="text-[14px] font-bold text-nagorik-red">
                  {userData.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg viewBox="0 0 24 24" fill="var(--color-nagorik-muted)">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}