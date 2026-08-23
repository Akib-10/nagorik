import { Link } from 'react-router-dom'
import logo from '../assets/images/logo_for_dark_mode.png'
import AuthLink from './AuthLink.jsx'

// Landing footer — identical DOM to index.html <footer class="site-footer">.
export default function LandingFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand"><img src={logo} alt="নাগরিক logo" /></span>
            <p>Turning local problems into visible, trackable, solvable civic issues. Your city deserves better — help us build it.</p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><Link to="/browse_feed">Home feed</Link></li>
              <li><AuthLink to="/report">Create report</AuthLink></li>
              <li><a href="#issues">Trending issues</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#top">About us</a></li>
              <li><a href="#top">Blog</a></li>
              <li><a href="#top">Careers</a></li>
              <li><a href="#top">Press kit</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <ul>
              <li><a href="#top">Privacy policy</a></li>
              <li><a href="#top">Terms of service</a></li>
              <li><a href="#top">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Nagorik. Made with ♥ for Dhaka.</span>
          <span className="socials"><a href="#top">Twitter</a><a href="#top">LinkedIn</a><a href="#top">GitHub</a></span>
        </div>
      </div>
    </footer>
  )
}
