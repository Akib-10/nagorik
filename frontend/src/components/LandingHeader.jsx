import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import logo from "../assets/images/logo_for_dark_mode.png";
import { MenuIcon, SearchIcon } from "./icons";

export default function LandingHeader() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeId, setActiveId] = useState("#top");
  const navRef = useRef(null);
  const toggleRef = useRef(null);
  const isManualScroll = useRef(false);
  const navigate = useNavigate();

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim()) {
      navigate(
        `/browse_feed?q=${encodeURIComponent(e.currentTarget.value.trim())}`
      );
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (
        navRef.current &&
        toggleRef.current &&
        !navRef.current.contains(e.target) &&
        !toggleRef.current.contains(e.target)
      ) {
        setNavOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("main [id]");
    const observer = new IntersectionObserver(
      (entries) => {
        // Prevent observer from overriding state during smooth scroll
        if (isManualScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(`#${entry.target.getAttribute("id")}`);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((sec) => observer.observe(sec));

    const onScroll = () => {
      if (isManualScroll.current) return;
      if (window.scrollY < 80) setActiveId("#top");
    };
    window.addEventListener("scroll", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Smooth scroll handler for all nav items
  const handleNavClick = (e, id) => {
    e.preventDefault();
    setActiveId(id);
    setNavOpen(false);

    // Lock scroll observer during animation
    isManualScroll.current = true;

    if (id === "#top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.replaceState(null, "", window.location.pathname);
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Unlock observer after smooth scroll completes
    setTimeout(() => {
      isManualScroll.current = false;
    }, 800);
  };

  const navLinkClass = (id) =>
    clsx(
      "rounded-full",
      "px-[15px]",
      "py-[9px]",
      "text-[14px]",
      "font-semibold",
      "transition-colors",
      "duration-200",
      "max-[920px]:px-3.5",
      "max-[920px]:py-3",
      activeId === id
        ? ["bg-nagorik-red/10", "!text-nagorik-red-dark"]
        : [
            "text-nagorik-text",
            "hover:bg-nagorik-red/15",
            "hover:!text-nagorik-red-dark",
            "dark:text-white/85",
          ]
    );

  const authBtnClass = clsx(
    "inline-flex",
    "items-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-full",
    "border",
    "border-nagorik-line",
    "bg-transparent",
    "px-5",
    "py-[10px]",
    "text-[14px]",
    "font-semibold",
    "text-nagorik-text",
    "transition-all",
    "duration-150",
    "hover:-translate-y-px",
    "hover:bg-nagorik-red",
    "hover:!text-white",
    "dark:border-white/25",
    "dark:text-white",
    "max-[480px]:px-3.5",
    "max-[480px]:py-2",
    "max-[480px]:text-[13px]",
    "max-[380px]:px-[14px]",
    "max-[380px]:py-[10px]"
  );

  return (
    <header
      id="top"
      className="sticky top-0 z-[100] border-b border-nagorik-line bg-nagorik-cream/86 backdrop-blur-[10px] dark:border-white/[0.08] dark:bg-[rgba(23,15,17,0.7)]"
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-7 px-7 py-[14px] max-[480px]:gap-2 max-[480px]:px-4 max-[480px]:py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
          aria-label="নাগরিক home"
          onClick={(e) => handleNavClick(e, "#top")}
        >
          <img src={logo} alt="নাগরিক logo" className="h-[50px] w-auto" />
        </Link>

        {/* Mobile nav toggle */}
        <button
          ref={toggleRef}
          className="hidden border-0 bg-transparent p-2 text-nagorik-text dark:text-white max-[920px]:inline-flex"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((open) => !open)}
        >
          <MenuIcon />
        </button>

        {/* Nav links */}
        <nav
          ref={navRef}
          className={clsx(
            "flex items-center gap-1.5",
            "max-[920px]:fixed max-[920px]:inset-[64px_16px_auto_16px] max-[920px]:flex-col max-[920px]:items-stretch max-[920px]:gap-0.5 max-[920px]:rounded-2xl max-[920px]:border max-[920px]:border-nagorik-line max-[920px]:bg-nagorik-red/5 max-[920px]:p-2.5 max-[920px]:shadow-[0_20px_50px_-20px_rgba(23,15,17,0.25)] max-[920px]:transition-[transform_0.18s_ease,opacity_0.18s_ease]",
            "max-[920px]:[&:not(.open)]:pointer-events-none max-[920px]:[&:not(.open)]:-translate-y-3 max-[920px]:[&:not(.open)]:opacity-0",
            navOpen && "open"
          )}
        >
          <a
            href="#top"
            className={navLinkClass("#top")}
            onClick={(e) => handleNavClick(e, "#top")}
          >
            Home
          </a>

          <a
            href="#how-it-works"
            className={navLinkClass("#how-it-works")}
            onClick={(e) => handleNavClick(e, "#how-it-works")}
          >
            How it works
          </a>

          <a
            href="#issues"
            className={navLinkClass("#issues")}
            onClick={(e) => handleNavClick(e, "#issues")}
          >
            Real issues
          </a>
        </nav>

        {/* Search bar */}
        <div className="flex flex-1 items-center gap-2 rounded-full border border-nagorik-line bg-nagorik-ink-soft/5 px-4 py-[9px] text-[13px] text-nagorik-muted max-w-[340px] max-[920px]:order-3 max-[920px]:w-full max-[920px]:basis-full max-[920px]:max-w-full dark:border-white/12 dark:bg-white/6 dark:text-white/60">
          <SearchIcon size={15} />
          <input
            type="text"
            placeholder="Search civic issues"
            aria-label="Search civic issues"
            onKeyDown={handleSearchKey}
            className="w-full border-0 bg-transparent font-[inherit] text-[13px] text-inherit outline-none placeholder:text-inherit placeholder:opacity-80"
          />
        </div>

        {/* Auth buttons */}
        <div className="ml-auto flex shrink-0 items-center gap-2 max-[480px]:gap-1.5">
          <Link to="/login" className={authBtnClass}>
            Log in
          </Link>
          <Link
            to="/login"
            state={{ mode: "register", from: "/report" }}
            className={authBtnClass}
          >
            <span className="max-[380px]:hidden">Sign Up</span>
          </Link>
        </div>
      </div>
    </header>
  );
}