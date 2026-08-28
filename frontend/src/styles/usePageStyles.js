import landingCss from './landing.css?inline'
import appCss from './style.css?inline'

const CSS_BY_KIND = {
  landing: landingCss,
  app: appCss,
}

let styleEl = null
function ensureStyleEl() {
  if (!styleEl) {
    styleEl = document.head.querySelector('style[data-page-styles]')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.dataset.pageStyles = 'true'
      document.head.appendChild(styleEl)
    }
  }
  return styleEl
}

let currentKind = null

export function setPageStyles(kind) {
  if (kind === currentKind) return
  ensureStyleEl().textContent = CSS_BY_KIND[kind] || ''
  currentKind = kind
}