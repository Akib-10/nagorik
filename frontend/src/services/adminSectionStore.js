// Remembers the last admin page the user was on - including its filters, tab
// and page number - so the header logo can send them back to exactly that page
// after they open a post (the post page lives outside the admin layout).
// Kept in sessionStorage so it survives a reload but not a new browser session.
const STORAGE_KEY = 'nagorik_admin_last_section'
const FALLBACK = '/admin'

const listeners = new Set()

let current = read()

function read() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored && stored.startsWith('/admin') ? stored : FALLBACK
  } catch {
    return FALLBACK
  }
}

export function getAdminSection() {
  return current
}

export function subscribeAdminSection(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// `focus` is a one-shot highlight (set by a "new report" notification); it is
// dropped so returning to the page does not re-pin a post that was already handled.
function withoutFocus(search) {
  if (!search) return ''
  const params = new URLSearchParams(search)
  params.delete('focus')
  const rest = params.toString()
  return rest ? `?${rest}` : ''
}

export function rememberAdminSection(pathname, search = '') {
  if (!pathname || !pathname.startsWith('/admin')) return
  const next = `${pathname}${withoutFocus(search)}`
  if (next === current) return
  current = next
  try {
    sessionStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Private browsing can reject writes - the in-memory value still works.
  }
  listeners.forEach((listener) => listener())
}
