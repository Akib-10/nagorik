// The original site loads exactly one stylesheet per page:
//   - landing pages (index.html, login.html)  -> styles/landing.css
//   - app pages (browse_feed, user, report)   -> styles/style.css
// Both files define rules for the same class names (.site-header, .hero,
// .tabs, .steps, ...) with different values, so they must never be active
// at the same time. This hook keeps that behaviour: it appends the right
// stylesheet to <head> while a page is mounted and removes it on unmount.
// The CSS files themselves are used verbatim.

import { useEffect } from 'react'
import landingCss from '../styles/landing.css?url'
import appCss from '../styles/style.css?url'

export default function usePageStyles(kind) {
  useEffect(() => {
    const href = kind === 'app' ? appCss : landingCss
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.dataset.pageStyles = kind
    link.href = href
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [kind])
}
