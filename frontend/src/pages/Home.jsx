import { useEffect, useState } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";
import AuthLink from "../components/AuthLink";
import useCountUp from "../hooks/useCountUp";
import { getIssueStats, getTrendingPreview } from "../services/issuesService";
import { optimizedUrl } from "../services/mediaService";
import heroBg from "../assets/images/landing-page-background2.png";
import {
  ShieldIcon,
  CameraIcon,
  ArrowUpIcon,
  BellIconLanding,
  MapFoldIcon,
} from "../components/icons";

const steps = [
  {
    no: "STEP 01",
    icon: <CameraIcon size={20} />,
    title: "Spot & snap",
    text: "See a pothole, a dark street, an overflowing drain? Take a photo, drop a pin on the map, and write a quick description.",
    iconBg: "bg-nagorik-red/8 text-nagorik-red",
  },
  {
    no: "STEP 02",
    icon: <ArrowUpIcon size={20} />,
    title: "Neighbours confirm",
    text: "Others upvote issues they've seen too. The more confirmations, the louder the signal to authorities.",
    iconBg: "bg-[rgba(232,163,61,0.14)] text-[#B87613]",
  },
  {
    no: "STEP 03",
    icon: <BellIconLanding size={20} />,
    title: "Authorities act",
    text: 'High-priority issues auto-notify the relevant city office. Track status live — from "Reported" to "Fixed".',
    iconBg: "bg-nagorik-green/12 text-nagorik-green",
  },
];

const features = [
  {
    icon: <CameraIcon size={18} />,
    title: "Photo & video reports",
    text: "Snap it, upload it. Visual evidence makes issues impossible to ignore.",
    iconBg: "bg-nagorik-red",
  },
  {
    icon: <MapFoldIcon />,
    title: "Live hotspot tracking",
    text: "See every civic problem in your area on one feed. Priorities become obvious.",
    iconBg: "bg-[#B87613]",
  },
  {
    icon: <ArrowUpIcon size={18} />,
    title: "Community voting",
    text: "Upvote issues you've seen too. The most-voted problems automatically escalate.",
    iconBg: "bg-nagorik-green",
  },
  {
    icon: <BellIconLanding size={18} />,
    title: "Authority alerts",
    text: "High-engagement issues ping the relevant city offices and utility teams directly.",
    iconBg: "bg-nagorik-red-dark",
  },
];

// Each authority opens its official site in a new tab.
const TRUST_LINKS = [
  { label: "🏛️ DNCC", name: "Dhaka North City Corporation", href: "https://dncc.gov.bd" },
  { label: "🏛️ DSCC", name: "Dhaka South City Corporation", href: "https://dscc.gov.bd" },
  { label: "⚡ DESCO", name: "Dhaka Electric Supply Company", href: "https://desco.gov.bd" },
  { label: "💧 WASA", name: "Dhaka WASA", href: "https://dwasa.org.bd" },
  { label: "🚌 BRTA", name: "Bangladesh Road Transport Authority", href: "https://brta.gov.bd" },
  { label: "🏗️ RAJUK", name: "RAJUK", href: "https://rajukdhaka.gov.bd" },
];

function statusStyle(label) {
  if (label === "In progress")
    return { text: "text-[#B87613]", dot: "bg-[#B87613]" };
  if (label === "Resolved")
    return { text: "text-nagorik-green", dot: "bg-nagorik-green" };
  return { text: "text-nagorik-red", dot: "bg-nagorik-red" };
}

// A number that counts up from 0 once the real value has arrived.
// Shows "—" while loading (or if the request failed) instead of a made-up figure.
function StatNumber({ value, suffix = "", ready }) {
  const shown = useCountUp(value);
  return <>{ready ? `${shown.toLocaleString("en-US")}${suffix}` : "—"}</>;
}

function IssueCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-nagorik-line bg-nagorik-paper">
      <div className="h-[150px] bg-nagorik-surface-2" />
      <div className="space-y-3 p-[18px_18px_20px]">
        <div className="h-3 w-20 rounded bg-nagorik-surface-2" />
        <div className="h-4 w-4/5 rounded bg-nagorik-surface-2" />
        <div className="h-3 w-3/5 rounded bg-nagorik-surface-2" />
      </div>
    </div>
  );
}

export default function Home() {
  // null = still loading (or the request failed)
  const [stats, setStats] = useState(null);
  const [trending, setTrending] = useState(null);

  useEffect(() => {
    document.title = "নাগরিক — Nagorik | Report civic issues, get them fixed";
  }, []);

  useEffect(() => {
    let cancelled = false;
    getIssueStats()
      .then((s) => !cancelled && setStats(s))
      .catch(() => {});
    getTrendingPreview(3)
      .then((list) => !cancelled && setTrending(list))
      .catch(() => !cancelled && setTrending([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const statItems = [
    { value: stats?.total ?? 0, label: "Issues reported", color: "text-nagorik-gold" },
    { value: stats?.resolved ?? 0, label: "Issues resolved", color: "text-[#7BC996]" },
    { value: stats?.cities ?? 0, label: "Cities active", color: "text-nagorik-gold" },
    { value: stats?.resolutionRate ?? 0, suffix: "%", label: "Resolution rate", color: "text-nagorik-gold" },
  ];

  return (
    <>
      <LandingHeader />

      <main>
        {/* ============ HERO ============ */}
        <section
          className={clsx(
            "relative",
            "flex",
            "min-h-[560px]",
            "items-center",
            "justify-center",
            "border-b",
            "border-nagorik-line",
            "dark:border-white/[0.08]",
            "bg-bottom",
            "bg-no-repeat",
            "bg-[length:120%_auto]",
            "max-[480px]:min-h-[420px]",
            "max-[480px]:bg-[length:220%_auto]",
            "max-[360px]:bg-[length:280%_auto]",
          )}
          style={{
            backgroundImage: `url(${heroBg})`,
          }}
        >
          {/* Hero Section elements */}
          <div
            className={clsx(
              "w-full",
              "max-w-[1000px]",
              "px-7",
              "pt-[25px]",
              "pb-[65px]",
              "text-center",
              "max-[480px]:pt-[20px]",
              "max-[480px]:pb-[60px]",
            )}
          >
            {/* top button properties */}
            <span
              className={clsx(
                "mb-8", //margin bottom
                "inline-flex",
                "items-center",
                "gap-2",
                "rounded-full",
                "text-[clamp(10,1vw,25px)]",
                "border-1",
                "border-nagorik-red/16",
                "bg-nagorik-red/7",
                "px-[18px]",
                "py-2",
                "text-[12px]",
                "font-semibold",
                "text-nagorik-red-dark",
              )}
            >
              <ShieldIcon />
              An Ultimate Civic Engagement Platform
            </span>

            {/* text group */}
            <div
              className={clsx(
                "flex",
                "flex-col",
                "gap-[35px]",
                "mt-2",
                "mb-9",
                "items-center",
              )}
            >
              {/* Title Text Properties */}
              <h1
                className={clsx(
                  "text-center",
                  "font-body",
                  "text-[clamp(30px,5vw,65px)]", //min, preferred, max font size
                  "font-extrabold",
                  "leading-[1]", //line height
                  "tracking-[-0.02em]", //letter spacing
                  "text-nagorik-text", //text color
                  "dark:text-white", //dark mode text color
                )}
              >
                Spot a problem,{" "}
                <em
                  className={clsx(
                    "font-normal",
                    "not-italic",
                    "text-nagorik-red",
                  )}
                >
                  Report it,
                </em>
                <br />
                watch it get fixed.
              </h1>
              {/* Sub-Text Properties */}
              <p
                className={clsx(
                  "mx-auto",
                  "w-full",
                  "max-w-[800px]",
                  "text-center",
                  "text-[clamp(15px,1.2vw,20px)]",
                  "leading-[1.1]",
                  "text-nagorik-muted",
                  "text-nagorik-muted-soft",
                  "dark:text-nagorik-muted",
                )}
                style={{ textWrap: "wrap" }}
              >
                Nagorik turns local problems into visible, trackable, solvable
                civic issues — connecting neighbours directly to the authorities
                who can act.
              </p>
            </div>

            {/* Button Properties */}
            <div
              className={clsx(
                "flex",
                "flex-wrap",
                "items-center",
                "justify-center",
                "gap-5.5",
              )}
            >
              <AuthLink
                to="/report"
                className={clsx(
                  "inline-flex",
                  "items-center",
                  "gap-2",
                  "whitespace-nowrap",
                  "rounded-full",
                  "border-2",
                  "border-nagorik-line",
                  "bg-nagorik-red",
                  "!text-white",
                  "px-7",
                  "py-[11px]",
                  "text-[15px]",
                  "font-semibold",
                  "transition-all",
                  "duration-150",
                  "hover:-translate-y-px",
                  "hover:bg-nagorik-red-dark",
                  "hover:border-nagorik-red-dark",
                  "hover:text-white",
                  "hover:shadow-[0_10px_24px_-10px_rgba(200,16,46,0.55)]",
                  "hover:px-10",
                  "hover:bg-nagorik-red",
                  "hover:border-nagorik-red",
                  "hover:!text-white",
                  "dark:border-white/25",
                  "dark:text-white",
                )}
              >
                Report an issue →
              </AuthLink>

              <Link
                to="/browse-feed"
                className={clsx(
                  "inline-flex",
                  "items-center",
                  "gap-2",
                  "whitespace-nowrap",
                  "rounded-full",
                  "border-2",
                  "border-nagorik-line",
                  "bg-nagorik-red",
                  "px-9",
                  "py-[11px]",
                  "text-[15px]",
                  "font-semibold",
                  "!text-white",
                  "transition-all",
                  "duration-150",
                  "hover:-translate-y-px",
                  "hover:bg-nagorik-red-dark",
                  "hover:border-nagorik-red",
                  "hover:text-white",
                  "hover:shadow-[0_10px_24px_-10px_rgba(200,16,46,0.55)]",
                  "hover:px-12",
                  "hover:bg-nagorik-red",
                  "hover:border-nagorik-red-dark",
                  "hover:!text-white",
                  "dark:border-white/25",
                  "dark:text-white",
                )}
              >
                Browse issues
              </Link>
            </div>
          </div>
        </section>

        {/* ============ STATS ============ */}
        <section
          className={clsx("bg-nagorik-ink-soft", "py-[38px]", "text-white")}
        >
          <div
            className={clsx(
              "mx-auto",
              "grid",
              "max-w-[1160px]",
              "grid-cols-4",
              "gap-0",
              "px-7",
              "max-[700px]:grid-cols-2",
              "max-[700px]:gap-y-6",
              "max-[480px]:px-4",
            )}
          >
            {statItems.map((stat) => (
              <div
                key={stat.label}
                className={clsx(
                  "border-l",
                  "border-nagorik-line",
                  "py-0",
                  "pr-5",
                  "text-center",
                  "first:border-l-0",
                  "max-[700px]:[&:nth-child(3)]:border-l-0",
                )}
              >
                <div
                  className={clsx(
                    "font-mono",
                    "text-[clamp(24px,3vw,32px)]",
                    "font-bold",
                    stat.color,
                  )}
                >
                  <StatNumber
                    value={stat.value}
                    suffix={stat.suffix}
                    ready={stats !== null}
                  />
                </div>
                <div
                  className={clsx("mt-1.5", "text-[12.5px]", "text-white/60")}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className={clsx("py-24")} id="how-it-works">
          <div
            className={clsx(
              "mx-auto",
              "max-w-[1160px]",
              "px-7",
              "max-[480px]:px-4",
            )}
          >
            <div
              className={clsx(
                "mx-auto",
                "mb-14",
                "max-w-[600px]",
                "text-center",
              )}
            >
              <span
                className={clsx(
                  "eyebrow-line",
                  "mb-3.5",
                  "flex",
                  "items-center",
                  "gap-2",
                  "font-mono",
                  "text-[12px]",
                  "uppercase",
                  "tracking-[0.14em]",
                  "text-nagorik-red",
                )}
                style={{ justifyContent: "center" }}
              >
                Simple as 1–2–3
              </span>
              <h2 className={clsx("mb-3.5", "text-[clamp(28px,3.4vw,38px)]")}>
                How <span className="text-nagorik-red">Nagorik</span> works
              </h2>
              <p className={clsx("text-[16px]", "text-nagorik-muted")}>
                Three steps between a broken road and a fixed one. In that
                order, every time.
              </p>
            </div>

            <div
              className={clsx(
                "grid",
                "grid-cols-3",
                "gap-[22px]",
                "max-[820px]:grid-cols-1",
              )}
            >
              {steps.map((step) => (
                <div
                  className={clsx(
                    "rounded-[18px]",
                    "border",
                    "border-nagorik-line",
                    "bg-nagorik-paper",
                    "p-[30px_26px]",
                    "relative",
                  )}
                  key={step.no}
                >
                  <span
                    className={clsx(
                      "mb-4",
                      "block",
                      "font-mono",
                      "text-[12px]",
                      "font-bold",
                      "tracking-[0.08em]",
                      "text-nagorik-red",
                    )}
                  >
                    {step.no}
                  </span>
                  <div
                    className={clsx(
                      "mb-[18px]",
                      "flex",
                      "h-[44px]",
                      "w-[44px]",
                      "items-center",
                      "justify-center",
                      "rounded-xl",
                      step.iconBg,
                    )}
                  >
                    {step.icon}
                  </div>
                  <h3 className={clsx("mb-2.5", "text-[19px]")}>
                    {step.title}
                  </h3>
                  <p className={clsx("text-[14.5px]", "text-nagorik-muted")}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ FEATURES ============ */}
        <section className={clsx("bg-nagorik-paper", "py-24")}>
          <div
            className={clsx(
              "mx-auto",
              "max-w-[1160px]",
              "px-7",
              "max-[480px]:px-4",
            )}
          >
            <div
              className={clsx(
                "mx-auto",
                "mb-14",
                "max-w-[600px]",
                "text-center",
              )}
            >
              <h2 className={clsx("mb-3.5", "text-[clamp(28px,3.4vw,38px)]")}>
                Built to actually{" "}
                <span className="text-nagorik-red">get things done</span>
              </h2>
              <p className={clsx("text-[16px]", "text-nagorik-muted")}>
                Not just a complaint box. A real system that connects citizens
                to authorities.
              </p>
            </div>

            <div
              className={clsx(
                "grid",
                "grid-cols-4",
                "gap-[18px]",
                "max-[920px]:grid-cols-2",
                "max-[560px]:grid-cols-1",
              )}
            >
              {features.map((feature) => (
                <div
                  className={clsx(
                    "rounded-2xl",
                    "border",
                    "border-nagorik-line",
                    "bg-nagorik-paper",
                    "p-[26px_22px]",
                  )}
                  key={feature.title}
                >
                  <div
                    className={clsx(
                      "mb-4",
                      "flex",
                      "h-10",
                      "w-10",
                      "items-center",
                      "justify-center",
                      "rounded-[11px]",
                      "text-white",
                      feature.iconBg,
                    )}
                  >
                    {feature.icon}
                  </div>
                  <h3 className={clsx("mb-2", "text-[16.5px]")}>
                    {feature.title}
                  </h3>
                  <p className={clsx("text-[13.8px]", "text-nagorik-muted")}>
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ REAL ISSUES ============ */}
        <section className={clsx("py-24")} id="issues">
          <div
            className={clsx(
              "mx-auto",
              "max-w-[1160px]",
              "px-7",
              "max-[480px]:px-4",
            )}
          >
            <div
              className={clsx(
                "mb-10",
                "flex",
                "items-end",
                "justify-between",
                "max-[640px]:flex-col",
                "max-[640px]:items-start",
                "max-[640px]:gap-4",
              )}
            >
              <div>
                <span
                  className={clsx(
                    "eyebrow-line",
                    "mb-3.5",
                    "flex",
                    "items-center",
                    "gap-2",
                    "font-mono",
                    "text-[12px]",
                    "uppercase",
                    "tracking-[0.14em]",
                    "text-nagorik-red",
                  )}
                >
                  Right now
                </span>
                <h2 className={clsx("mb-3.5", "text-[clamp(28px,3.4vw,38px)]")}>
                  Real issues.{" "}
                  <span className="text-nagorik-red">Right now.</span>
                </h2>
                <p
                  className={clsx("mt-2", "text-[16px]", "text-nagorik-muted")}
                >
                  Community-reported and actively being tracked.
                </p>
              </div>
              <Link
                to="/browse-feed"
                className={clsx(
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
                  "hover:bg-nagorik-ink-soft/5",
                  "dark:border-white/25",
                  "dark:text-white",
                  "dark:hover:bg-white/[0.08]",
                )}
              >
                View all issues →
              </Link>
            </div>

            <div
              className={clsx(
                "grid",
                "grid-cols-3",
                "gap-[22px]",
                "max-[920px]:grid-cols-2",
                "max-[640px]:grid-cols-1",
              )}
            >
              {trending === null ? (
                [0, 1, 2].map((n) => <IssueCardSkeleton key={n} />)
              ) : trending.length === 0 ? (
                <p
                  className={clsx(
                    "col-span-full",
                    "rounded-2xl",
                    "border",
                    "border-nagorik-line",
                    "bg-nagorik-paper",
                    "px-6",
                    "py-12",
                    "text-center",
                    "text-[15px]",
                    "text-nagorik-muted",
                  )}
                >
                  No reports are trending yet. Be the first to{" "}
                  <AuthLink
                    to="/report"
                    className="font-bold text-nagorik-red hover:underline"
                  >
                    report an issue
                  </AuthLink>
                  .
                </p>
              ) : (
                trending.map((issue) => {
                  const status = statusStyle(issue.statusLabel);
                  const place =
                    [issue.thana || issue.area, issue.city]
                      .filter(Boolean)
                      .join(", ") || "Location not set";
                  return (
                    <Link
                      to={`/post/${issue.id}`}
                      key={issue.id}
                      className="block"
                    >
                      <article
                        className={clsx(
                          "h-full",
                          "overflow-hidden",
                          "rounded-2xl",
                          "border",
                          "border-nagorik-line",
                          "bg-nagorik-paper",
                          "transition-all",
                          "duration-150",
                          "hover:-translate-y-1",
                          "hover:shadow-[0_20px_50px_-20px_rgba(23,15,17,0.25)]",
                          "dark:hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]",
                        )}
                      >
                        <div
                          className={clsx(
                            "relative",
                            "h-[150px]",
                            "bg-cover",
                            "bg-center",
                            !issue.img && "bg-nagorik-surface-2",
                          )}
                          style={
                            issue.img
                              ? {
                                  backgroundImage: `url('${optimizedUrl(issue.img, { width: 600 })}')`,
                                }
                              : undefined
                          }
                        >
                          {issue.category && (
                            <span
                              className={clsx(
                                "absolute",
                                "left-2.5",
                                "top-2.5",
                                "flex",
                                "items-center",
                                "gap-[5px]",
                                "rounded-full",
                                "bg-[rgba(23,15,17,0.72)]",
                                "px-2.5",
                                "py-[5px]",
                                "text-[11px]",
                                "font-bold",
                                "text-white",
                              )}
                            >
                              {issue.category}
                            </span>
                          )}
                        </div>
                        <div className={clsx("p-[18px_18px_20px]")}>
                          <span
                            className={clsx(
                              "mb-2.5",
                              "inline-flex",
                              "items-center",
                              "gap-1.5",
                              "font-mono",
                              "text-[11px]",
                              "font-bold",
                              "uppercase",
                              "tracking-[0.04em]",
                              status.text,
                            )}
                          >
                            <i
                              className={clsx(
                                "inline-block",
                                "h-[7px]",
                                "w-[7px]",
                                "rounded-full",
                                status.dot,
                              )}
                            ></i>
                            {issue.statusLabel}
                          </span>
                          <h4
                            className={clsx(
                              "mb-1.5",
                              "text-[16px]",
                              "leading-[1.3]",
                            )}
                          >
                            {issue.title}
                          </h4>
                          <div
                            className={clsx(
                              "mb-3.5",
                              "text-[12.5px]",
                              "text-nagorik-muted",
                            )}
                          >
                            📍 {place} · {issue.time}
                          </div>
                          <div
                            className={clsx(
                              "flex",
                              "gap-3.5",
                              "font-mono",
                              "text-[12px]",
                              "text-nagorik-muted",
                            )}
                          >
                            <span
                              className={clsx("flex", "items-center", "gap-[5px]")}
                            >
                              ▲ {issue.up}
                            </span>
                            <span
                              className={clsx("flex", "items-center", "gap-[5px]")}
                            >
                              💬 {issue.comments}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* ============ TRUST STRIP ============ */}
        <section
          className={clsx("border-y", "border-nagorik-line", "py-[44px]")}
        >
          <div
            className={clsx(
              "mx-auto",
              "max-w-[1160px]",
              "px-7",
              "max-[480px]:px-4",
            )}
          >
            <div
              className={clsx(
                "mb-[26px]",
                "text-center",
                "font-mono",
                "text-[11.5px]",
                "uppercase",
                "tracking-[0.12em]",
                "text-nagorik-muted-soft",
              )}
            >
              VERIFIED WITH GOVERNMENT AUTHORITIES
            </div>
            <div
              className={clsx(
                "flex",
                "flex-wrap",
                "items-center",
                "justify-center",
                "gap-10",
                "text-[14px]",
                "font-bold",
                "text-nagorik-muted",
              )}
            >
              {TRUST_LINKS.map(({ label, name, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${name} — official website`}
                  className={clsx(
                    "flex",
                    "items-center",
                    "gap-2",
                    "opacity-75",
                    "transition-opacity",
                    "duration-150",
                    "hover:opacity-100",
                    "hover:text-nagorik-red",
                  )}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className={clsx("py-12")}>
          <div
            className={clsx(
              "mx-auto",
              "max-w-[1160px]",
              "px-7",
              "max-[480px]:px-4",
            )}
          >
            <div
              className={clsx(
                "relative",
                "overflow-hidden",
                "rounded-[28px]",
                "bg-[radial-gradient(120%_160%_at_50%_0%,var(--color-nagorik-red-dark),var(--color-nagorik-red-deep)_70%)]",
                "px-8",
                "pt-6",  // <--- Changed from py-12 to pt-6 to reduce top padding
                "pb-12", // <--- Added pb-12 to maintain the bottom padding
                "flex",
                "flex-col",
                "items-center",
                "justify-center",
                "text-center",
                "text-white",
              )}
            >
              <h2
                className={clsx(
                  "mb-3.5",
                  "text-white",
                  "text-[clamp(26px,3.1vw,38px)]",
                  "font-bold",
                )}
              >
                Your city needs you
              </h2>
              <p
                className={clsx(
                  "mb-10", // Increased from mb-[30px] to mb-10 (40px)
                  "w-full",
                  "max-w-[520px]",
                  "text-[clamp(15px,1.3vw,17px)]",
                  "leading-relaxed",
                  "text-white/80",
                )}
              >
                Every report you submit makes your neighbourhood a little
                better.
                {stats?.citizens > 0 &&
                  ` Join ${stats.citizens.toLocaleString("en-US")} ${
                    stats.citizens === 1 ? "citizen" : "citizens"
                  } already making a difference.`}
              </p>
              <div
                className={clsx(
                  "mt-4", // Added margin-top to clearly separate the buttons from the text
                  "flex",
                  "flex-wrap",
                  "items-center",
                  "justify-center",
                  "gap-3.5",
                )}
              >
                <Link
                  to="/login"
                  className={clsx(
                    "inline-flex",
                    "items-center",
                    "gap-2",
                    "whitespace-nowrap",
                    "rounded-full",
                    "bg-white",
                    "px-5",
                    "py-[10px]",
                    "text-[14px]",
                    "font-bold",
                    "!text-nagorik-red-dark",
                    "transition-all",
                    "duration-150",
                    "hover:-translate-y-px",
                    "hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)]",
                  )}
                >
                  Join Nagorik — it's free
                </Link>
                <a
                  href="#issues"
                  className={clsx(
                    "inline-flex",
                    "items-center",
                    "gap-2",
                    "whitespace-nowrap",
                    "rounded-full",
                    "border",
                    "border-white/35",
                    "bg-transparent",
                    "px-5",
                    "py-[10px]",
                    "text-[14px]",
                    "font-semibold",
                    "text-white",
                    "transition-all",
                    "duration-150",
                    "hover:-translate-y-px",
                    "hover:bg-white/[0.08]",
                  )}
                >
                  Browse without signing up →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter flush />
    </>
  );
}
