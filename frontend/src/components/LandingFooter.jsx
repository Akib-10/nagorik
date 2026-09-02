import { Link } from 'react-router-dom'
import logo from '../assets/images/logo_for_dark_mode.png'
import AuthLink from './AuthLink.jsx'

export default function LandingFooter() {
  return (
    <footer className="mt-24 bg-nagorik-ink px-0 pb-7 pt-16 text-white/70">
      <div className="mx-auto max-w-[1160px] px-7">
        <div className="grid gap-8 pb-10 border-b border-white/[0.08] max-[820px]:grid-cols-2 max-[520px]:grid-cols-1">
          <div className="max-w-[260px]">
            <span className="mb-3 ml-[-20px] flex h-[60px] items-center">
              <img src={logo} alt="নাগরিক logo" className="h-[60px] w-auto" />
            </span>
            <p className="text-[13.5px] text-white/50">Turning local problems into visible, trackable, solvable civic issues. Your city deserves better — help us build it.</p>
          </div>
          <div>
            <h5 className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-white/45">Product</h5>
            <ul>
              <li className="mb-2.5"><Link to="/browse_feed" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Home feed</Link></li>
              <li className="mb-2.5"><AuthLink to="/report" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Create report</AuthLink></li>
              <li className="mb-2.5"><a href="#issues" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Trending issues</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-white/45">Company</h5>
            <ul>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">About us</a></li>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Blog</a></li>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Careers</a></li>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Press kit</a></li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.1em] text-white/45">Legal</h5>
            <ul>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Privacy policy</a></li>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Terms of service</a></li>
              <li className="mb-2.5"><a href="#top" className="text-[14px] text-white/75 transition-colors hover:text-nagorik-gold">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-[12.5px] text-white/40">
          <span>© 2026 Nagorik. Made with ♥ for Dhaka.</span>
          <span className="flex gap-4">
            <a href="#top" className="text-white/50 transition-colors hover:text-white">Twitter</a>
            <a href="#top" className="text-white/50 transition-colors hover:text-white">LinkedIn</a>
            <a href="#top" className="text-white/50 transition-colors hover:text-white">GitHub</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
