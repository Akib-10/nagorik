// The original site loads exactly one stylesheet per page:
//   - landing pages (index.html, login.html)  -> styles/landing.css
//   - app pages (browse_feed, user, report)   -> styles/style.css
// Both files define rules for the same class names (.site-header, .hero,
// .tabs, .steps, ...) with different values, so they must never be active
// at the same time. This hook keeps that behaviour.
//
// Both sheets are added to <head> once (disabled) and toggled inside
// useLayoutEffect, i.e. synchronously BEFORE the browser paints. Swapping
// a single <link>'s href would load asynchronously and leave the new page
// unstyled for a frame (logo flashing at full size); toggling two
// pre-loaded sheets is instant, so page switches have no transition.

import { useLayoutEffect } from 'react'
import landingCss from '../styles/landing.css?url'
import appCss from '../styles/style.css?url'

const SHEETS = [
  { kind: 'landing', href: landingCss },
  { kind: 'app', href: appCss },
]

function ensureLink({ kind, href }) {
  let link = document.head.querySelector(`link[data-page-styles="${kind}"]`)
  if (!link) {
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.dataset.pageStyles = kind
    link.href = href
    // Disabled before insertion so the sheet never applies by accident.
    link.disabled = true
    document.head.appendChild(link)
  }
  return link
}

export default function usePageStyles(kind) {
  useLayoutEffect(() => {
    for (const sheet of SHEETS) {
      ensureLink(sheet).disabled = sheet.kind !== kind
    }
  }, [kind])
}
