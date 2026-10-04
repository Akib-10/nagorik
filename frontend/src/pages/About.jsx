import { useEffect } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import LandingFooter from "../components/LandingFooter";
import AuthLink from "../components/AuthLink";

const POINTS = [
  {
    title: "Spot & snap",
    text: "See a pothole, a dark street, an overflowing drain? Take a photo, drop a pin on the map and write a quick description.",
  },
  {
    title: "Neighbours confirm",
    text: "Others upvote issues they've seen too. The more confirmations, the louder the signal to authorities.",
  },
  {
    title: "Authorities act",
    text: "High-priority issues reach the relevant city office. Track the status live, from Open to Resolved.",
  },
];

export default function About() {
  useEffect(() => {
    document.title = "About us | নাগরিক — Nagorik";
  }, []);

  return (
    <>
      <AppHeader logoHref="/" />

      <main className="mx-auto max-w-[860px] px-7 pt-14 max-[480px]:px-4">
        <span className="mb-3.5 block font-mono text-[12px] uppercase tracking-[0.14em] text-nagorik-red">
          About us
        </span>
        <h1 className="mb-4 text-[clamp(30px,4.4vw,46px)] font-extrabold leading-[1.1] text-nagorik-heading">
          Local problems, made <span className="text-nagorik-red">visible</span>.
        </h1>
        <p className="mb-10 text-[16px] leading-relaxed text-nagorik-muted">
          Nagorik turns local problems into visible, trackable, solvable civic
          issues, connecting neighbours directly to the authorities who can act.
          Your city deserves better, and this is where we build it together.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-4">
          {POINTS.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl border border-nagorik-line bg-nagorik-paper p-6"
            >
              <span className="mb-2 block font-mono text-[12px] font-bold tracking-[0.08em] text-nagorik-red">
                STEP 0{i + 1}
              </span>
              <h2 className="mb-1.5 text-[18px] text-nagorik-heading">{p.title}</h2>
              <p className="text-[14.5px] text-nagorik-muted">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3.5">
          <AuthLink
            to="/report"
            className="inline-flex items-center rounded-full bg-nagorik-red px-6 py-[11px] text-[14px] font-bold !text-white transition-colors duration-150 hover:bg-nagorik-hover-red"
          >
            Report an issue
          </AuthLink>
          <Link
            to="/browse-feed"
            className="inline-flex items-center rounded-full border-2 border-nagorik-red px-6 py-[9px] text-[14px] font-bold text-nagorik-red transition-colors duration-150 hover:bg-nagorik-red hover:!text-white"
          >
            Browse issues
          </Link>
        </div>
      </main>

      <LandingFooter />
    </>
  );
}
