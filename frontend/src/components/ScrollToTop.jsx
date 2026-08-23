import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router keeps the scroll position across route changes, and the
// landing stylesheet sets html{scroll-behavior:smooth} — together that
// makes navigating to a page "slide" through the content with the sticky
// logo riding along. Jump straight to the top instantly on every route
// change instead.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
