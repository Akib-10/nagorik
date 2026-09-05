import { useEffect } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";
import AuthLink from "../components/AuthLink";
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

const issues = [
  {
    thumb:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=60",
    cat: "🛣️ Road",
    statusClass: "text-[#B87613]",
    dotClass: "bg-[#B87613]",
    statusLabel: "In progress",
    title: "Large pothole on Mirpur Road causing accidents",
    loc: "📍 Mirpur 10, Dhaka · 2 days ago",
    up: 342,
    comments: 47,
    meToo: 89,
  },
  {
    thumb:
      "https://images.unsplash.com/photo-1518481852452-9415b262eba4?w=600&q=60",
    cat: "⚡ Electricity",
    statusClass: "text-nagorik-red",
    dotClass: "bg-nagorik-red",
    statusLabel: "Open",
    title: "Street lights out on entire Green Road stretch",
    loc: "📍 Dhanmondi, Dhaka · 3 days ago",
    up: 215,
    comments: 31,
    meToo: 67,
  },
  {
    thumb:
      "https://images.unsplash.com/photo-1523867574650-fd3ee4b32e8f?w=600&q=60",
    cat: "💧 Water",
    statusClass: "text-nagorik-red",
    dotClass: "bg-nagorik-red",
    statusLabel: "Open",
    title: "Sewage overflow near Hatirjheel lake inlet",
    loc: "📍 Hatirjheel, Dhaka · 5 days ago",
    up: 489,
    comments: 62,
    meToo: 143,
  },
];

export default function Home() {
  useEffect(() => {
    document.title = "নাগরিক — Nagorik | Report civic issues, get them fixed";
  }, []);

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
            "max-[480px]:min-h-0",
          )}
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "120% auto",
            backgroundPosition: "bottom center",
            backgroundRepeat: "no-repeat",

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
                to="/browse_feed"
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
          className={clsx(
            "bg-nagorik-ink-soft", 
            "py-[38px]", 
            "text-white"
          )}
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
            {[
              {
                value: "14,820+",
                label: "Issues reported",
                color: "text-nagorik-gold",
              },
              {
                value: "3,241+",
                label: "Issues resolved",
                color: "text-[#7BC996]",
              },
              {
                value: "6",
                label: "Cities active",
                color: "text-nagorik-gold",
              },
              {
                value: "89%",
                label: "Resolution rate",
                color: "text-nagorik-gold",
              },
            ].map((stat) => (
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
                  {stat.value}
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
                to="/browse_feed"
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
              {issues.map((issue) => (
                <article
                  className={clsx(
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
                  key={issue.title}
                >
                  <div
                    className={clsx(
                      "relative",
                      "h-[150px]",
                      "bg-cover",
                      "bg-center",
                    )}
                    style={{ backgroundImage: `url('${issue.thumb}')` }}
                  >
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
                      {issue.cat}
                    </span>
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
                        issue.statusClass,
                      )}
                    >
                      <i
                        className={clsx(
                          "inline-block",
                          "h-[7px]",
                          "w-[7px]",
                          "rounded-full",
                          issue.dotClass,
                        )}
                      ></i>
                      {issue.statusLabel}
                    </span>
                    <h4
                      className={clsx("mb-1.5", "text-[16px]", "leading-[1.3]")}
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
                      {issue.loc}
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
                      <span
                        className={clsx("flex", "items-center", "gap-[5px]")}
                      >
                        🟢 Me too {issue.meToo}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
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
              {[
                "🏛️ DNCC",
                "🏛️ DSCC",
                "⚡ DESCO",
                "💧 WASA",
                "🚌 BRTA",
                "🏗️ RAJUK",
              ].map((label) => (
                <span
                  key={label}
                  className={clsx(
                    "flex",
                    "items-center",
                    "gap-2",
                    "opacity-75",
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className={clsx("py-24")}>
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
                "py-[72px]",
                "text-center",
                "text-white",
              )}
            >
              <h2
                className={clsx(
                  "mb-3.5",
                  "text-white",
                  "text-[clamp(26px,3.4vw,38px)]",
                )}
              >
                Your city needs you
              </h2>
              <p
                className={clsx(
                  "mx-auto",
                  "mb-[30px]",
                  "w-full",
                  "max-w-[520px]",
                  "text-center",
                  "text-[clamp(15px,1.6vw,17px)]",
                  "leading-relaxed",
                  "text-white/80",
                )}
              >
                Every report you submit makes your neighbourhood a little
                better. Join 12,000+ citizens already making a difference.
              </p>
              <div
                className={clsx(
                  "flex",
                  "flex-wrap",
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
                    "font-semibold",
                    "text-nagorik-red",
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

      <LandingFooter />
    </>
  );
}
